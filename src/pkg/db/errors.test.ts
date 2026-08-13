import { describe, it, expect } from "vitest";
import { handleDatabaseError } from "./errors";

describe("handleDatabaseError", () => {
  describe("UNIQUE constraint violations → 409 Conflict", () => {
    it("maps error with SQLITE_CONSTRAINT_UNIQUE code", () => {
      const error = Object.assign(
        new Error("UNIQUE constraint failed: users.email"),
        { code: "SQLITE_CONSTRAINT_UNIQUE" }
      );
      const result = handleDatabaseError(error);
      expect(result.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A record with this value already exists.");
    });

    it("maps error with UNIQUE constraint message (no code)", () => {
      const error = new Error("UNIQUE constraint failed: posts.slug");
      const result = handleDatabaseError(error);
      expect(result.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A record with this value already exists.");
    });

    it("does not expose table or column names", () => {
      const error = Object.assign(
        new Error("UNIQUE constraint failed: users.email"),
        { code: "SQLITE_CONSTRAINT_UNIQUE" }
      );
      const result = handleDatabaseError(error);
      expect(result.message).not.toContain("users");
      expect(result.message).not.toContain("email");
      expect(result.message).not.toContain("UNIQUE constraint failed");
    });
  });

  describe("FOREIGN KEY constraint violations → 400 Bad Request", () => {
    it("maps error with SQLITE_CONSTRAINT_FOREIGNKEY code", () => {
      const error = Object.assign(
        new Error("FOREIGN KEY constraint failed"),
        { code: "SQLITE_CONSTRAINT_FOREIGNKEY" }
      );
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Referenced record does not exist.");
    });

    it("maps error with FOREIGN KEY constraint message (no code)", () => {
      const error = new Error("FOREIGN KEY constraint failed");
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Referenced record does not exist.");
    });
  });

  describe("NOT NULL constraint violations → 400 Bad Request", () => {
    it("maps error with SQLITE_CONSTRAINT_NOTNULL code", () => {
      const error = Object.assign(
        new Error("NOT NULL constraint failed: posts.title"),
        { code: "SQLITE_CONSTRAINT_NOTNULL" }
      );
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A required field is missing.");
    });

    it("maps error with NOT NULL constraint message (no code)", () => {
      const error = new Error("NOT NULL constraint failed: categories.name");
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A required field is missing.");
    });

    it("does not expose column names", () => {
      const error = Object.assign(
        new Error("NOT NULL constraint failed: posts.title"),
        { code: "SQLITE_CONSTRAINT_NOTNULL" }
      );
      const result = handleDatabaseError(error);
      expect(result.message).not.toContain("posts");
      expect(result.message).not.toContain("title");
    });
  });

  describe("CHECK constraint violations → 400 Bad Request", () => {
    it("maps error with SQLITE_CONSTRAINT_CHECK code", () => {
      const error = Object.assign(
        new Error("CHECK constraint failed: valid_status"),
        { code: "SQLITE_CONSTRAINT_CHECK" }
      );
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A field value is invalid.");
    });

    it("maps error with CHECK constraint message (no code)", () => {
      const error = new Error("CHECK constraint failed: valid_position");
      const result = handleDatabaseError(error);
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe("A field value is invalid.");
    });
  });

  describe("Unknown errors → 500 Internal Server Error", () => {
    it("returns internalServerError for generic Error", () => {
      const error = new Error("Something went wrong");
      const result = handleDatabaseError(error);
      expect(result.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Internal server error. Please try again later."
      );
    });

    it("returns internalServerError for non-Error values", () => {
      const result = handleDatabaseError("string error");
      expect(result.status).toBe(500);
      expect(result.success).toBe(false);
    });

    it("returns internalServerError for null", () => {
      const result = handleDatabaseError(null);
      expect(result.status).toBe(500);
      expect(result.success).toBe(false);
    });

    it("returns internalServerError for undefined", () => {
      const result = handleDatabaseError(undefined);
      expect(result.status).toBe(500);
      expect(result.success).toBe(false);
    });
  });
});
