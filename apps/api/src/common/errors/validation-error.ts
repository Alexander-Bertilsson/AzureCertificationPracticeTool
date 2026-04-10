import { AppError } from './app-error.js';

export class ValidationError extends AppError {
  override readonly name: string = 'ValidationError';

  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', 400, message, details);
  }
}
