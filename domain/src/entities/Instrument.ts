import { DomainError } from "../errors/DomainError";

export class Instrument {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly urlIco: string,
  ) {}

  static create(id: number, name: string, urlIco = ""): Instrument {
    if (!name || name.trim().length === 0) {
      throw new DomainError("InstrumentError", "Instrument name cannot be empty");
    }
    return new Instrument(id, name, urlIco);
  }

  static rehydrate(id: number, name: string, urlIco = ""): Instrument {
    return new Instrument(id, name, urlIco);
  }
}
