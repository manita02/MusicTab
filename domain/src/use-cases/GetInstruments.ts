import { IInstrumentRepository } from "../repositories/IInstrumentRepository";
import { Instrument } from "../entities/Instrument";

export class GetInstruments {
  constructor(private instrumentRepo: IInstrumentRepository) {}

  async execute(): Promise<Instrument[]> {
    return this.instrumentRepo.findAll();
  }
}