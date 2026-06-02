"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instrument = void 0;
const DomainError_1 = require("../errors/DomainError");
class Instrument {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static create(id, name) {
        if (!name || name.trim().length === 0) {
            throw new DomainError_1.DomainError("InstrumentError", "Instrument name cannot be empty");
        }
        return new Instrument(id, name);
    }
    static rehydrate(id, name) {
        return new Instrument(id, name);
    }
}
exports.Instrument = Instrument;
//# sourceMappingURL=Instrument.js.map