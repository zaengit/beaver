import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { migrate as migrateSqlite } from "drizzle-orm/sqlite-proxy/migrator"
import { migrate as migrateMysql } from "drizzle-orm/mysql2/migrator"
import { migrate as migratePgsql } from "drizzle-orm/node-postgres/migrator"

import { databaseConfig } from "@zbeaver/beaver/app/config/database"
import { db, executeSqliteMigrations } from "./index"

function resolveMigrationsFolder() {
  const dialect = databaseConfig.connection
  const packaged = fileURLToPath(new URL(`./migrations/${dialect}/`, import.meta.url))
  const source = fileURLToPath(new URL(`../../../migrations/${dialect}/`, import.meta.url))
  const legacySqlite = fileURLToPath(new URL("../../../migrations/", import.meta.url))
  const candidates = dialect === "sqlite" ? [packaged, source, legacySqlite] : [packaged, source]
  const folder = candidates.find((candidate) => existsSync(join(candidate, "meta", "_journal.json")))
  if (!folder) throw new Error(`No ${dialect} database migrations were packaged.`)
  return folder
}

export async function migrate() {
  const migrationsFolder = resolveMigrationsFolder()
  const config = { migrationsFolder }

  if (databaseConfig.connection === "sqlite") {
    await migrateSqlite(db, executeSqliteMigrations, config)
  } else if (databaseConfig.connection === "mysql") {
    await migrateMysql(db as unknown as Parameters<typeof migrateMysql>[0], config)
  } else {
    await migratePgsql(db as unknown as Parameters<typeof migratePgsql>[0], config)
  }
}
