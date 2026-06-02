"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const DomainError_1 = require("../errors/DomainError");
class Session {
    constructor(token, userId, expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
        if (expiresAt.getTime() < Date.now()) {
            throw new DomainError_1.DomainError("SessionError", "Expiration date cannot be in the past");
        }
    }
    static create(token, userId, expiresInSeconds) {
        if (!token || !userId) {
            throw new DomainError_1.DomainError("SessionError", "Token and userId are required");
        }
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        return new Session(token, userId, expiresAt);
    }
    static rehydrate(token, userId, expiresAt) {
        return new Session(token, userId, expiresAt);
    }
    isExpired() {
        return this.expiresAt.getTime() < Date.now();
    }
}
exports.Session = Session;
//# sourceMappingURL=Session.js.map