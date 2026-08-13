import { describe, it, expect } from "vitest";
import { checkConcurrentEdit } from "./optimistic-lock";

describe("checkConcurrentEdit", () => {
  describe("when expectedUpdatedAt is not provided", () => {
    it("returns null for undefined", () => {
      const result = checkConcurrentEdit(1000, undefined);
      expect(result).toBeNull();
    });

    it("returns null for null", () => {
      const result = checkConcurrentEdit(1000, null);
      expect(result).toBeNull();
    });
  });

  describe("when a concurrent edit is detected", () => {
    it("returns a warning when currentUpdatedAt > expectedUpdatedAt", () => {
      const result = checkConcurrentEdit(1001, 1000);
      expect(result).not.toBeNull();
      expect(result!.warning).toBe(
        "This record was modified by another user since you loaded it. Your changes have been applied."
      );
    });

    it("returns a warning for large time differences", () => {
      const result = checkConcurrentEdit(2000, 1000);
      expect(result).not.toBeNull();
      expect(result!.warning).toContain("modified by another user");
    });
  });

  describe("when no conflict exists", () => {
    it("returns null when currentUpdatedAt equals expectedUpdatedAt", () => {
      const result = checkConcurrentEdit(1000, 1000);
      expect(result).toBeNull();
    });

    it("returns null when currentUpdatedAt < expectedUpdatedAt", () => {
      // This shouldn't normally happen, but the function handles it gracefully
      const result = checkConcurrentEdit(999, 1000);
      expect(result).toBeNull();
    });
  });
});
