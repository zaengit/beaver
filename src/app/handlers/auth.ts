import { verifyPassword } from "@zbeaver/beaver/app/auth"
import { getUserByEmail } from "@zbeaver/beaver/app/services/users"
import { loginSchema } from "@zbeaver/beaver/app/validations/auth"

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
  const userResult = getUserByEmail(email)
  if (!userResult.success) {
    return {
      success: false as const,
      status: 401,
      message: "Invalid credentials.",
    }
  }

  const isValid = await verifyPassword(password, userResult.data.password)
  if (!isValid) {
    return {
      success: false as const,
      status: 401,
      message: "Invalid credentials.",
    }
  }

  const { password: _password, ...safeUser } = userResult.data
  return {
    success: true as const,
    status: 200,
    message: "Login successful.",
    user: safeUser,
  }
}
