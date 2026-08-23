import { verifyPassword } from "@zbeaver/beaver/app/auth"
import { getUserByEmail } from "@zbeaver/beaver/app/services/users"
import { loginSchema } from "@zbeaver/beaver/app/validations/auth"
import { isWithinRateLimit } from "@zbeaver/beaver/app/security/rate-limit"

const DUMMY_PASSWORD_HASH = "$2b$12$o0uJ9XsFOcfthEY.ALXOH.hYe9WJIhl6AFPTnQ5gOOJ5OMaarBZN2"

export async function handlePasswordLogin(body: unknown) {
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return {
      success: false as const,
      status: 422,
      message: "Validation error.",
    }
  }

  const { email, password } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  if (!isWithinRateLimit("login:global", 100, 15 * 60 * 1000)) {
    return {
      success: false as const,
      status: 429,
      message: "Too many requests. Please try again later.",
    }
  }
  if (!isWithinRateLimit(`login:email:${normalizedEmail}`, 5, 15 * 60 * 1000)) {
    return {
      success: false as const,
      status: 429,
      message: "Too many requests. Please try again later.",
    }
  }

  const userResult = await getUserByEmail(email)
  const isValid = await verifyPassword(password, userResult.success ? userResult.data.password : DUMMY_PASSWORD_HASH)
  if (!userResult.success || !isValid) {
    return {
      success: false as const,
      status: 401,
      message: "Invalid credentials.",
    }
  }

  const safeUser = { ...userResult.data }
  Reflect.deleteProperty(safeUser, "password")
  return {
    success: true as const,
    status: 200,
    message: "Login successful.",
    user: safeUser,
  }
}
