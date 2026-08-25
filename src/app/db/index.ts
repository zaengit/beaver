import { chmodSync, existsSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import Database from "better-sqlite3"
import mysql from "mysql2/promise"
import { Pool } from "pg"
import { drizzle as drizzleSqlite } from "drizzle-orm/sqlite-proxy"
import type { AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy"
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2"
import { drizzle as drizzlePgsql } from "drizzle-orm/node-postgres"

import { databaseConfig } from "@zbeaver/beaver/app/config/database"
import { schema } from "./schema"

const sqliteClient = databaseConfig.connection === "sqlite"
  ? createSqliteClient(databaseConfig.database)
  : null

const mysqlClient = databaseConfig.connection === "mysql"
  ? mysql.createPool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : undefined,
    })
  : null

const pgClient = databaseConfig.connection === "pgsql"
  ? new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      max: 10,
      ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : undefined,
    })
  : null

const databaseTables = [
  "admin_two_factor",
  "admin_refresh_sessions",
  "password_reset_tokens",
  "post_categories",
  // Legacy tables retained so migrate:fresh can remove pre-static-role schemas.
  "role_permissions",
  "posts",
  "menus",
  "categories",
  "media",
  "settings",
  "activity_logs",
  "users",
  "permissions",
  "roles",
  "__drizzle_migrations",
] as const

export async function closeDatabase() {
  if (sqliteClient) {
    sqliteClient.close()
    return
  }
  if (mysqlClient) {
    await mysqlClient.end()
    return
  }
  if (pgClient) await pgClient.end()
}

/**
 * Drop only Beaver's tables and the Drizzle migration journal.
 *
 * This is intentionally separate from migrations so the CLI can implement a
 * safe, explicit `migrate:fresh` workflow without dropping unrelated tables
 * in a shared database/schema.
 */
export async function resetDatabase() {
  if (sqliteClient) {
    sqliteClient.pragma("foreign_keys = OFF")
    try {
      sqliteClient.exec(databaseTables.map((table) => `DROP TABLE IF EXISTS "${table}"`).join(";\n"))
    } finally {
      sqliteClient.pragma("foreign_keys = ON")
    }
    return
  }

  if (mysqlClient) {
    const connection = await mysqlClient.getConnection()
    try {
      await connection.query("SET FOREIGN_KEY_CHECKS = 0")
      for (const table of databaseTables) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``)
      }
    } finally {
      try {
        await connection.query("SET FOREIGN_KEY_CHECKS = 1")
      } finally {
        connection.release()
      }
    }
    return
  }

  if (pgClient) {
    const quotedTables = databaseTables.map((table) => `"${table}"`).join(", ")
    await pgClient.query(`DROP TABLE IF EXISTS ${quotedTables} CASCADE`)
    // Drizzle's PostgreSQL migrator stores its journal in this dedicated
    // schema, so dropping only the application tables would make the next
    // migration appear already applied.
    await pgClient.query('DROP SCHEMA IF EXISTS "drizzle" CASCADE')
  }
}

function createSqliteClient(dbPath: string) {
  const isFileDatabase = dbPath !== ":memory:" && !dbPath.startsWith("file:")
  const dbDir = isFileDatabase ? dirname(dbPath) : null
  if (dbDir && dbDir !== "." && dbDir !== "") {
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true, mode: 0o700 })
    chmodSync(dbDir, 0o700)
  }

  const sqlite = new Database(dbPath)
  if (isFileDatabase) chmodSync(dbPath, 0o600)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")
  if (isFileDatabase) {
    for (const suffix of ["-wal", "-shm"]) {
      const journalPath = `${dbPath}${suffix}`
      if (existsSync(journalPath)) chmodSync(journalPath, 0o600)
    }
  }
  return sqlite
}

const executeSqlite: AsyncRemoteCallback = async (sql, params, method) => {
  const statement = sqliteClient!.prepare(sql)
  if (method === "run") {
    const result = statement.run(...params)
    return { rows: [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }] }
  }
  if (method === "get") {
    const row = statement.raw().get(...params) as unknown[] | undefined
    return { rows: row as never[] }
  }
  if (method === "values") return { rows: statement.raw().all(...params) }
  return { rows: statement.raw().all(...params) }
}

export async function executeSqliteMigrations(queries: string[]) {
  // The proxy migrator also passes its journal INSERT statements in this
  // array. Executing each item separately prevents a migration ending in a
  // statement without a semicolon from being concatenated with the next
  // migration's first statement (for example, `INSERT ...` followed by
  // `PRAGMA foreign_keys = OFF`).
  for (const query of queries) {
    if (query.trim()) sqliteClient!.exec(query)
  }
}

// Drizzle's dialect-specific database types are intentionally hidden behind
// this boundary. Repositories use the same table contract and the async
// execute() API for all three drivers.
const sqliteDb = drizzleSqlite(executeSqlite, { schema: schema as Record<string, unknown> })
export const db = (databaseConfig.connection === "sqlite"
  ? sqliteDb
  : databaseConfig.connection === "mysql"
    ? drizzleMysql({ client: mysqlClient!, schema: schema as Record<string, unknown>, mode: "default" })
    : drizzlePgsql({ client: pgClient!, schema: schema as Record<string, unknown> })) as unknown as typeof sqliteDb

export { databaseConfig }
