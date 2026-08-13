import { describe, it, expect } from "vitest"
import {
  hashPassword,
  verifyPassword,
} from "./index"

describe("auth", () => {
  describe("hashPassword", () => {
    it("should return a bcrypt hash string", async () => {
      const hash = await hashPassword("testpassword123")
      expect(hash).toBeDefined()
      expect(hash).toMatch(/^\$2[aby]\$12\$/)
    })

    it("should produce different hashes for the same password", async () => {
      const hash1 = await hashPassword("samepassword")
      const hash2 = await hashPassword("samepassword")
      expect(hash1).not.toBe(hash2)
    })

    it("should use cost factor 12", async () => {
      const hash = await hashPassword("password")
      // bcrypt hash format: $2b$12$<salt+hash>
      // split("$") → ["", "2b", "12", "<salt+hash>"]
      const parts = hash.split("$")
      expect(parts[2]).toBe("12")
    })
  })

  describe("verifyPassword", () => {
    it("should return true for matching password and hash", async () => {
      const password = "correctpassword"
      const hash = await hashPassword(password)
      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it("should return false for non-matching password", async () => {
      const hash = await hashPassword("correctpassword")
      const result = await verifyPassword("wrongpassword", hash)
      expect(result).toBe(false)
    })

    it("should return false for empty password against a hash", async () => {
      const hash = await hashPassword("somepassword")
      const result = await verifyPassword("", hash)
      expect(result).toBe(false)
    })
  })
})
