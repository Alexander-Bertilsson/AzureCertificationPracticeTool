import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: FastifyError | Error,
  req: FastifyRequest,
  reply: FastifyReply,
): void {
  const requestId = req.id;

  if (err instanceof AppError) {
    req.log.warn({ err, requestId, code: err.code }, 'app error');
    const body: ErrorEnvelope = {
      error: { code: err.code, message: err.message, requestId },
    };
    if (err.details !== undefined) {
      body.error.details = err.details;
    }
    void reply.status(err.httpStatus).send(body);
    return;
  }

  if (err instanceof ZodError) {
    req.log.warn({ err, requestId }, 'request validation failed');
    void reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten(),
        requestId,
      },
    } satisfies ErrorEnvelope);
    return;
  }

  // Fastify wraps schema validation failures (including ones produced by the
  // zod type provider) in a FastifyError with `validation` set and statusCode 400.
  const fastifyErr = err as FastifyError & { validation?: unknown };
  if (Array.isArray(fastifyErr.validation)) {
    req.log.warn({ err, requestId }, 'request validation failed');
    void reply.status(fastifyErr.statusCode ?? 400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: fastifyErr.validation,
        requestId,
      },
    } satisfies ErrorEnvelope);
    return;
  }

  // Unknown error: log the full thing at error level so we never lose context,
  // then return a generic 500 to the client.
  req.log.error({ err, requestId }, 'unhandled error');
  void reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  } satisfies ErrorEnvelope);
}
