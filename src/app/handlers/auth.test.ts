import { describe, expect, it, vi, beforeEach } from "vitest"

const mockVerifyPassword = vi.fn()
const mockGetUserByEmail = vi.fn()
const mockLoginSchema = { safeParse: vi.fn() }

vi.mock("zadm/app/auth", () => ({
  verifyPassword: mockVerifyPassword,
}))

vi.mock("zadm/app/services/users", () => ({
  getUserByEmail: mockGetUserByEmail,
}))

vi.mock("zadm/app/validations/auth", () => ({
  loginSchema: mockLoginSchema,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("handlePasswordLogin", () => {
  it("returns 422 validation error when body fails schema validation", async () => {
    mockLoginSchema.safeParse.mockReturnValue({ success: false })

    const { handlePasswordLogin } = await import("./auth")
    const result = await handlePasswordLogin({ email: "bad", password: "" })

    expect(result.success).toBe(false)
    expect(result.status).toBe(422)
    expect(result.message).toBe("Validation error.")
  })

  it("returns 401 when user not found", async () => {
    mockLoginSchema.safeParse.mockReturnValue({ success: true, data: { email: "test@example.com", password: "pass" } })
    mockGetUserByEmail.mockReturnValue({ success: false, error: { code: "not_found" } })

    const { handlePasswordLogin } = await import("./auth")
    const result = await handlePasswordLogin({ email: "test@example.com", password: "pass" })

    expect(result.success).toBe(false)
    expect(result.status).toBe(401)
    expect(result.message).toBe("Invalid credentials.")
  })

  it("returns 401 on incorrect password", async () => {
    mockLoginSchema.safeParse.mockReturnValue({ success: true, data: { email: "test@example.com", password: "wrong" } })
    mockGetUserByEmail.mockReturnValue({
      success: true,
      data: { id: "user-1", email: "test@example.com", password: "hashed" },
      message: "OK",
    })
    mockVerifyPassword.mockResolvedValue(false)

    const { handlePasswordLogin } = await import("./auth")
    const result = await handlePasswordLogin({ email: "test@example.com", password: "wrong" })

    expect(result.success).toBe(false)
    expect(result.status).toBe(401)
    expect(result.message).toBe("Invalid credentials.")
  })

  it("returns 200 with user on successful login", async () => {
    mockLoginSchema.safeParse.mockReturnValue({ success: true, data: { email: "test@example.com", password: "pass" } })
    mockGetUserByEmail.mockReturnValue({
      success: true,
      data: { id: "user-1", email: "test@example.com", password: "hashed", name: "Test User", roleId: "role-1" },
      message: "OK",
    })
    mockVerifyPassword.mockResolvedValue(true)

    const { handlePasswordLogin } = await import("./auth")
    const result = await handlePasswordLogin({ email: "test@example.com", password: "pass" })

    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.message).toBe("Login successful.")
    expect(result.user).toHaveProperty("id", "user-1")
    expect(result.user).toHaveProperty("name", "Test User")
    expect(result.user).not.toHaveProperty("password")
  })

  it("returns 401 on generic service error (non-not-found)", async () => {
    mockLoginSchema.safeParse.mockReturnValue({ success: true, data: { email: "test@example.com", password: "pass" } })
    mockGetUserByEmail.mockReturnValue({ success: false, error: { code: "db_error", message: "DB down" } })

    const { handlePasswordLogin } = await import("./auth")
    const result = await handlePasswordLogin({ email: "test@example.com", password: "pass" })

    expect(result.success).toBe(false)
    expect(result.status).toBe(401)
  })
})