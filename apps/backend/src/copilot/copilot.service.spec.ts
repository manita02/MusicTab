import { COPILOT } from './copilot.constants';
import { CopilotService } from './copilot.service';
import { CopilotGraphService } from './graph/copilot.graph';
import { CopilotQuotaService } from './quota/copilot-quota.service';

describe('CopilotService', () => {
  const graph = { run: jest.fn() };
  const quota = {
    getQuota: jest.fn(),
    assertCanConsume: jest.fn(),
    increment: jest.fn(),
  };

  const service = new CopilotService(
    graph as unknown as CopilotGraphService,
    quota as unknown as CopilotQuotaService,
  );

  beforeEach(() => {
    graph.run.mockReset();
    quota.getQuota.mockReset();
    quota.assertCanConsume.mockReset();
    quota.increment.mockReset();
  });

  it('no llama a Gemini ni incrementa cuota si el mensaje supera 100 caracteres', async () => {
    await expect(service.chat(1, 'x'.repeat(COPILOT.MAX_INPUT_CHARS + 1))).rejects.toMatchObject({
      copilotCode: 'INPUT_TOO_LONG',
    });
    expect(graph.run).not.toHaveBeenCalled();
    expect(quota.assertCanConsume).not.toHaveBeenCalled();
    expect(quota.increment).not.toHaveBeenCalled();
  });

  it('incrementa la cuota solo después de un turno 2xx del grafo', async () => {
    graph.run.mockResolvedValue({ reply: 'ok', hits: [], intent: 'search_catalog' });
    quota.assertCanConsume.mockResolvedValue(undefined);
    quota.increment.mockResolvedValue({ used: 1, remaining: 4, limit: 5 });

    const result = await service.chat(7, '¿hay tabs de Milo J?');

    expect(quota.assertCanConsume).toHaveBeenCalledWith(7);
    expect(graph.run).toHaveBeenCalledTimes(1);
    expect(quota.increment).toHaveBeenCalledWith(7);
    expect(result.quota).toEqual({ used: 1, remaining: 4, limit: 5 });
  });

  it('no incrementa cuota si el grafo falla', async () => {
    quota.assertCanConsume.mockResolvedValue(undefined);
    graph.run.mockRejectedValue(new Error('gemini down'));

    await expect(service.chat(7, 'hola')).rejects.toThrow('gemini down');
    expect(quota.increment).not.toHaveBeenCalled();
  });

  it('alinea my_quota con el cupo ya incrementado', async () => {
    graph.run.mockResolvedValue({ reply: 'desfasado', hits: [], intent: 'my_quota' });
    quota.assertCanConsume.mockResolvedValue(undefined);
    quota.increment.mockResolvedValue({ used: 3, remaining: 2, limit: 5 });

    const result = await service.chat(7, 'cuántos mensajes me quedan');
    expect(result.reply).toContain('3 de 5');
    expect(result.reply).toContain('Te quedan 2');
  });
});
