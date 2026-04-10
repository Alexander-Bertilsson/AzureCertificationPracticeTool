/**
 * Base class for all known/expected error conditions in the API.
 *
 * Subclasses set a stable machine-readable `code`, an HTTP status, and an
 * optional `details` payload. The global error handler maps these to the
 * standard JSON envelope.
 *
 * Throw `AppError` subclasses for contract violations only — never use them
 * as flow control. Repositories return `null` for expected absences; services
 * with `require*` names are the place to convert that into a thrown error.
 */
export class AppError extends Error {
  override readonly name: string = 'AppError';
  readonly code: string;
  readonly httpStatus: number;
  readonly details: unknown;

  constructor(code: string, httpStatus: number, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
