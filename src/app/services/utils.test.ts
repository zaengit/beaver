import { describe, it, expect } from "vitest"
import {
  serviceSuccess,
  serviceForbidden,
  serviceNotFound,
  serviceConflict,
  serviceValidationError,
  serviceUnauthorized,
} from "./utils"

describe("serviceSuccess", () => {
  it("returns success with data and message", () => {
    const result = serviceSuccess({ id: "1", name: "Test" }, "Created.")
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: "1", name: "Test" })
    expect(result.message).toBe("Created.")
  })

  it("works with null data", () => {
    const result = serviceSuccess(null, "Deleted.")
    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
    expect(result.message).toBe("Deleted.")
  })

  it("works with array data", () => {
    const result = serviceSuccess([1, 2, 3], "Listed.")
    expect(result.success).toBe(true)
    expect(result.data).toEqual([1, 2, 3])
  })
})

describe("serviceForbidden", () => {
  it("returns forbidden error with default message", () => {
    const result = serviceForbidden()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("forbidden")
      expect(result.error.message).toBe("Forbidden.")
    }
  })

  it("returns forbidden error with custom message", () => {
    const result = serviceForbidden("Access denied.")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("forbidden")
      expect(result.error.message).toBe("Access denied.")
    }
  })
})

describe("serviceNotFound", () => {
  it("returns not_found error with default resource", () => {
    const result = serviceNotFound()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("not_found")
      expect(result.error.message).toBe("Resource not found.")
    }
  })

  it("returns not_found error with custom resource", () => {
    const result = serviceNotFound("User")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("not_found")
      expect(result.error.message).toBe("User not found.")
    }
  })
})

describe("serviceConflict", () => {
  it("returns conflict error with field and default message", () => {
    const result = serviceConflict("email")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("conflict")
      expect(result.error.message).toBe("Already exists.")
      expect(result.error.fieldErrors).toEqual({ email: ["Already exists."] })
    }
  })

  it("returns conflict error with custom message", () => {
    const result = serviceConflict("username", "Username taken.")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("conflict")
      expect(result.error.message).toBe("Username taken.")
      expect(result.error.fieldErrors).toEqual({ username: ["Username taken."] })
    }
  })
})

describe("serviceValidationError", () => {
  it("returns validation error with field errors", () => {
    const result = serviceValidationError({ name: ["Required"], email: ["Invalid format"] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("validation")
      expect(result.error.message).toBe("Validation error.")
      expect(result.error.fieldErrors).toEqual({
        name: ["Required"],
        email: ["Invalid format"],
      })
    }
  })

  it("handles empty field errors", () => {
    const result = serviceValidationError({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("validation")
      expect(result.error.fieldErrors).toEqual({})
    }
  })
})

describe("serviceUnauthorized", () => {
  it("returns unauthorized error", () => {
    const result = serviceUnauthorized()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("unauthorized")
      expect(result.error.message).toBe("Unauthorized.")
    }
  })
})