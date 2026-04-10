import { AppError } from './app-error.js';

export class ConflictError extends AppError {
  override readonly name: string = 'ConflictError';

  constructor(message: string, details?: unknown) {
    super('CONFLICT', 409, message, details);
  }
}
