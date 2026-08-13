import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import {
  loginSchema,
  registerSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "./auth"

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
    })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securepass1",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid registration data with roleId", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securepass1",
      roleId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "john@example.com",
      password: "securepass1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects name longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      name: "a".repeat(101),
      email: "john@example.com",
      password: "securepass1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password longer than 128 characters", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "a".repeat(129),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid roleId format", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "securepass1",
      roleId: "invalid-ulid",
    })
    expect(result.success).toBe(false)
  })

  it("allows roleId to be omitted", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "securepass1",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.roleId).toBeUndefined()
    }
  })
})

describe("passwordResetRequestSchema", () => {
  it("accepts valid email", () => {
    const result = passwordResetRequestSchema.safeParse({
      email: "user@example.com",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = passwordResetRequestSchema.safeParse({
      email: "not-valid",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing email", () => {
    const result = passwordResetRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("passwordResetSchema", () => {
  it("accepts valid token and password", () => {
    const result = passwordResetSchema.safeParse({
      token: "abc123def456",
      password: "newpassword1",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty token", () => {
    const result = passwordResetSchema.safeParse({
      token: "",
      password: "newpassword1",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password shorter than 8 characters", () => {
    const result = passwordResetSchema.safeParse({
      token: "validtoken",
      password: "short",
    })
    expect(result.success).toBe(false)
  })

  it("rejects password longer than 128 characters", () => {
    const result = passwordResetSchema.safeParse({
      token: "validtoken",
      password: "a".repeat(129),
    })
    expect(result.success).toBe(false)
  })
})

describe("Auth Schemas - Property-Based Tests", () => {
  /**
   * **Validates: Requirements 9.8**
   * Property: Any well-formed email (alphanumeric local + domain) with password >= 8 chars is accepted.
   */
  it("loginSchema accepts well-formed email with password >= 8 chars", () => {
    // Generate emails that conform to Zod's email validation:
    // local part: alphanumeric, no leading/trailing dots, no consecutive dots
    const simpleEmail = fc
      .tuple(
        fc.stringMatching(/^[a-z][a-z0-9]{0,19}$/),
        fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/),
        fc.constantFrom("com", "org", "net", "io", "dev")
      )
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

    fc.assert(
      fc.property(
        simpleEmail,
        fc.string({ minLength: 8, maxLength: 128 }),
        (email, password) => {
          const result = loginSchema.safeParse({ email, password })
          expect(result.success).toBe(true)
        }
      )
    )
  })

  /**
   * **Validates: Requirements 1.6**
   * Property: Passwords shorter than 8 characters are always rejected.
   */
  it("loginSchema rejects any password shorter than 8 characters", () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 0, maxLength: 7 }),
        (email, password) => {
          const result = loginSchema.safeParse({ email, password })
          expect(result.success).toBe(false)
        }
      )
    )
  })

  /**
   * **Validates: Requirements 9.7**
   * Property: registerSchema roleId must be a valid ULID when provided.
   */
  it("registerSchema rejects non-ULID roleId strings", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          (s) => !/^[0-9A-HJKMNP-TV-Z]{26}$/.test(s)
        ),
        (roleId) => {
          const result = registerSchema.safeParse({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            roleId,
          })
          expect(result.success).toBe(false)
        }
      )
    )
  })
})
