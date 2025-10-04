import { Instrument } from "../entities/Instrument";

export interface IInstrumentRepository {
  findById(id: number): Promise<Instrument | null>;
  findAll(): Promise<Instrument[]>;
}
