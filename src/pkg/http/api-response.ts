// Standardized API Response Helpers
// Used by server actions to return consistent response structures.

// --- Core Response Interfaces ---

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface CreatedResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  data: null;
  errors?: Record<string, string[]>;
}

// --- 2xx Success Helpers ---

export function ok<T>(
  message: string,
  data: T
): SuccessResponse<T> & { status: number } {
  return {
    success: true,
    message,
    data,
    status: 200,
  };
}

export function created<T>(
  message: string,
  data: T
): CreatedResponse<T> & { status: number } {
  return {
    success: true,
    message,
    data,
    status: 201,
  };
}

export function paginated<T>(
  message: string,
  data: T[],
  meta: PaginationMeta,
  links: PaginationLinks
): PaginatedResponse<T> & { status: number } {
  return {
    success: true,
    message,
    data,
    meta,
    links,
    status: 200,
  };
}

// --- 4xx Client Error Helpers ---

export function badRequest(
  message: string = "Bad request.",
  errors?: Record<string, string[]>
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
    status: 400,
  };
}

export function unauthorized(
  message: string = "Unauthorized.",
  errors?: Record<string, string[]>
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
    status: 401,
  };
}

export function forbidden(
  message: string = "Insufficient permissions."
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    status: 403,
  };
}

export function notFound(
  message: string = "Resource not found."
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    status: 404,
  };
}

export function conflict(
  message: string,
  errors?: Record<string, string[]>
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
    status: 409,
  };
}

export function unprocessableEntity(
  message: string = "Validation error.",
  errors?: Record<string, string[]>
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
    status: 422,
  };
}

export function tooManyRequests(
  message: string = "Too many requests. Please try again later."
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    status: 429,
  };
}

// --- 5xx Server Error Helpers ---

export function internalServerError(
  message: string = "Internal server error. Please try again later."
): ErrorResponse & { status: number } {
  return {
    success: false,
    message,
    data: null,
    status: 500,
  };
}
