import { getAdminCredentials } from "@zbeaver/beaver/app/config/security"
import { seedData, type SeedDataOptions, type SeedDataSummary } from "./seed-data"

/** Seed the environment-managed system configuration. */
export async function seed(options?: SeedDataOptions): Promise<void | SeedDataSummary> {
  if (options && (options.filePath || options.dryRun || options.overwrite)) {
    return seedData(options)
  }

  const admin = getAdminCredentials()
  console.log(`✅ System seed complete (environment-managed Super Admin: ${admin.email})`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exitCode = 1
  })
}
