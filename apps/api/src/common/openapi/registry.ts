import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Single OpenAPI registry for the API. Each module registers its zod schemas
 * and routes here so the generated OpenAPI document is the single source of
 * truth that backs Swagger UI and is shared with the frontend.
 */
export const openApiRegistry = new OpenAPIRegistry();
