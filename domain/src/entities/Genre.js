"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Genre = void 0;
const DomainError_1 = require("../errors/DomainError");
class Genre {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static create(id, name) {
        if (!name || name.trim().length === 0) {
            throw new DomainError_1.DomainError("GenreError", "Genre name cannot be empty");
        }
        return new Genre(id, name);
    }
    static rehydrate(id, name) {
        return new Genre(id, name);
    }
}
exports.Genre = Genre;
//# sourceMappingURL=Genre.js.map