import { getAdminCredentials } from "@zbeaver/beaver/app/config/security"

export async function resetSuperAdminPassword() {
  const admin = getAdminCredentials()
  return { email: admin.email }
}
