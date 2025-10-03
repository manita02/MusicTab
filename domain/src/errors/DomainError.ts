export class DomainError extends Error {
    readonly code: string;
    constructor(code: string, message?: string) {
      super(message ?? code);
      this.name = "DomainError";
      this.code = code;
    }
  }
  
  export class NotFoundError extends DomainError {
    constructor(message?: string) {
      super("NotFound", message);
    }
  }
  
  export class ConflictError extends DomainError {
    constructor(message?: string) {
      super("Conflict", message);
    }
  }
  