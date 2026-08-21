import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { db } from "./index"

const migrationsFolder = fileURLToPath(new URL("./migrations/", import.meta.url))

export function migrate() {
  const sqlite = db.$client
  const journal = JSON.parse(readFileSync(join(migrationsFolder, "meta", "_journal.json"), "utf8"))
  const migrationTable = "__drizzle_migrations"

  sqlite.exec(`CREATE TABLE IF NOT EXISTS ${migrationTable} (id INTEGER PRIMARY KEY, hash text NOT NULL, created_at numeric)`)
  const lastMigration = sqlite
    .prepare(`SELECT created_at FROM ${migrationTable} ORDER BY created_at DESC LIMIT 1`)
    .get() as { created_at?: number | null } | undefined
  const lastCreatedAt = Number(lastMigration?.created_at ?? -1)
  const recordMigration = sqlite.prepare(`INSERT INTO ${migrationTable} (hash, created_at) VALUES (?, ?)`)

  sqlite.exec("BEGIN")
  try {
    for (const entry of journal.entries) {
      if (entry.when <= lastCreatedAt) continue
      const sql = readFileSync(join(migrationsFolder, `${entry.tag}.sql`), "utf8")
      sqlite.exec(sql)
      recordMigration.run(createHash("sha256").update(sql).digest("hex"), entry.when)
    }
    sqlite.exec("COMMIT")
  } catch (error) {
    sqlite.exec("ROLLBACK")
    throw error
  }
}
