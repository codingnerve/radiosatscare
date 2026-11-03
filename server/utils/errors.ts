export type ErrorCode =
  | "VALIDATION_ERROR"
  | "TOO_FAST"
  | "RATE_LIMITED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SEND_FAILED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static validation(message: string, fields?: Record<string, string>): AppError {
    return new AppError(400, "VALIDATION_ERROR", message, fields);
  }
  static unauthenticated(message = "Authentication required"): AppError {
    return new AppError(401, "UNAUTHENTICATED", message);
  }
  static forbidden(message = "You do not have permission to do that"): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }
  static sendFailed(message = "We could not send your enquiry just now. Please try again in a few minutes or call us."): AppError {
    return new AppError(502, "SEND_FAILED", message);
  }
  static notFound(message = "Not found"): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }
}

export interface ErrorBody {
  ok: false;
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
}

export function errorBody(code: ErrorCode, message: string, fields?: Record<string, string>): ErrorBody {
  return { ok: false, error: { code, message, ...(fields ? { fields } : {}) } };
}
