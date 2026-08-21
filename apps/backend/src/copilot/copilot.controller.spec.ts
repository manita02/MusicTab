import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { COPILOT } from './copilot.constants';

describe('CopilotController', () => {
  let app: INestApplication;
  const copilot = {
    chat: jest.fn(),
    getQuota: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CopilotController],
      providers: [{ provide: CopilotService, useValue: copilot }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    copilot.chat.mockReset();
    copilot.getQuota.mockReset();
  });

  it('POST /copilot/chat con 281 caracteres responde 400 INPUT_TOO_LONG y no llama al servicio', async () => {
    const res = await request(app.getHttpServer())
      .post('/copilot/chat')
      .send({ message: 'a'.repeat(COPILOT.MAX_INPUT_CHARS + 1) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INPUT_TOO_LONG');
    expect(copilot.chat).not.toHaveBeenCalled();
  });

  it('POST /copilot/chat con mensaje vacío responde 400 INPUT_TOO_LONG', async () => {
    const res = await request(app.getHttpServer()).post('/copilot/chat').send({ message: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INPUT_TOO_LONG');
    expect(copilot.chat).not.toHaveBeenCalled();
  });
});
