import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
const isFileDatabase = dbPath !== ":memory:" && !dbPath.startsWith("file:");
const dbDir = isFileDatabase ? dirname(dbPath) : null;
if (dbDir && dbDir !== "." && dbDir !== "") {
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true, mode: 0o700 });
  chmodSync(dbDir, 0o700);
}

const sqlite = new Database(dbPath);
if (isFileDatabase) {
  chmodSync(dbPath, 0o600);
}
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
if (isFileDatabase) {
  for (const suffix of ["-wal", "-shm"]) {
    const journalPath = `${dbPath}${suffix}`;
    if (existsSync(journalPath)) chmodSync(journalPath, 0o600);
  }
}

export const db = drizzle(sqlite, { schema });
