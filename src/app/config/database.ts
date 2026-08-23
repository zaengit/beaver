export type DatabaseConnection = "sqlite" | "mysql" | "pgsql"

export interface DatabaseConfig {
  connection: DatabaseConnection
  database: string
  host?: string
  port?: number
  username?: string
  password?: string
  ssl: boolean
}

function env(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`${value} is not a valid database port.`)
  }
  return port
}

function parseBoolean(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true"
}

type LegacyDatabaseConfig = Pick<DatabaseConfig, "connection" | "database" | "host" | "port" | "username" | "password" | "ssl">

function legacyDatabaseUrl(): Partial<LegacyDatabaseConfig> {
  const value = env("DATABASE_URL")
  if (!value) return {}

  if (value === ":memory:" || value.startsWith("file:") || !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    return { connection: "sqlite", database: value }
  }

  try {
    const url = new URL(value)
    const protocol = url.protocol.toLowerCase()
    const connection = protocol === "mysql:" || protocol === "mysql2:"
      ? "mysql"
      : protocol === "postgres:" || protocol === "postgresql:"
        ? "pgsql"
        : undefined
    if (!connection) throw new Error("DATABASE_URL must be a SQLite path, mysql:// URL, or postgres:// URL.")

    const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""))
    if (!database) throw new Error("DATABASE_URL must include a database name.")
    const defaultPort = connection === "mysql" ? 3306 : 5432
    const sslMode = url.searchParams.get("sslmode")
    return {
      connection,
      database,
      host: url.hostname || "127.0.0.1",
      port: parsePort(url.port, defaultPort),
      username: url.username ? decodeURIComponent(url.username) : connection === "mysql" ? "root" : "postgres",
      password: url.password ? decodeURIComponent(url.password) : "",
      ssl: url.searchParams.get("ssl") === "true" || (sslMode !== null && sslMode !== "disable"),
    }
  } catch {
    throw new Error("DATABASE_URL is not a valid database URL.")
  }

}

function normalizeConnection(value: string | undefined): DatabaseConnection | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase()
  if (normalized === "sqlite") return "sqlite"
  if (normalized === "mysql" || normalized === "mysql2") return "mysql"
  if (normalized === "pgsql" || normalized === "postgres" || normalized === "postgresql") return "pgsql"
  throw new Error(`Unsupported DB_CONNECTION "${value}". Use sqlite, mysql, or pgsql.`)
}

export function getDatabaseConfig(): DatabaseConfig {
  const legacy = legacyDatabaseUrl()
  const connection = normalizeConnection(env("DB_CONNECTION")) ?? legacy.connection ?? "sqlite"

  if (connection === "sqlite") {
    return {
      connection,
      database: env("DB_DATABASE") ?? (legacy.connection === "sqlite" ? legacy.database : undefined) ?? "./db/sqlite.db",
      ssl: false,
    }
  }

  const defaultPort = connection === "mysql" ? 3306 : 5432
  const database = env("DB_DATABASE") ?? (legacy.connection === connection ? legacy.database : undefined)
  if (!database) {
    throw new Error(`DB_DATABASE is required when DB_CONNECTION=${connection}.`)
  }

  return {
    connection,
    database,
    host: env("DB_HOST") ?? (legacy.connection === connection ? legacy.host : undefined) ?? "127.0.0.1",
    port: parsePort(env("DB_PORT"), legacy.connection === connection ? legacy.port ?? defaultPort : defaultPort),
    username: env("DB_USERNAME") ?? (legacy.connection === connection ? legacy.username : undefined) ?? (connection === "mysql" ? "root" : "postgres"),
    password: process.env.DB_PASSWORD ?? (legacy.connection === connection ? legacy.password : undefined) ?? "",
    ssl: env("DB_SSL") !== undefined ? parseBoolean(env("DB_SSL")) : (legacy.connection === connection ? legacy.ssl ?? false : false),
  }
}

export const databaseConfig = getDatabaseConfig()
