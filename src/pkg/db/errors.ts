import { badRequest, conflict, internalServerError } from "zadm/pkg/http/api-response";

/**
 * Maps SQLite database constraint violation errors to user-friendly
 * standardized API responses without exposing database internals.
 *
 * better-sqlite3 throws errors with a `code` property (e.g., "SQLITE_CONSTRAINT_UNIQUE")
 * or the message contains the constraint type description.
 */
export function handleDatabaseError(error: unknown) {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code ?? "";
    const message = error.message;

    // UNIQUE constraint violation → 409 Conflict
    if (
      code === "SQLITE_CONSTRAINT_UNIQUE" ||
      message.includes("UNIQUE constraint failed")
    ) {
      return conflict("A record with this value already exists.");
    }

    // FOREIGN KEY constraint violation → 400 Bad Request
    if (
      code === "SQLITE_CONSTRAINT_FOREIGNKEY" ||
      message.includes("FOREIGN KEY constraint failed")
    ) {
      return badRequest("Referenced record does not exist.");
    }

    // NOT NULL constraint violation → 400 Bad Request
    if (
      code === "SQLITE_CONSTRAINT_NOTNULL" ||
      message.includes("NOT NULL constraint failed")
    ) {
      return badRequest("A required field is missing.");
    }

    // CHECK constraint violation → 400 Bad Request
    if (
      code === "SQLITE_CONSTRAINT_CHECK" ||
      message.includes("CHECK constraint failed")
    ) {
      return badRequest("A field value is invalid.");
    }
  }

  // Any other error → 500 Internal Server Error
  return internalServerError();
}
