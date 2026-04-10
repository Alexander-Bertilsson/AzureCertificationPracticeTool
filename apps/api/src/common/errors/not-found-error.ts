import { AppError } from './app-error.js';

export class NotFoundError extends AppError {
  override readonly name: string = 'NotFoundError';

  constructor(message: string, details?: unknown) {
    super('NOT_FOUND', 404, message, details);
  }
}
