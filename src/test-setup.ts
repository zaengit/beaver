import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

vi.mock("better-sqlite3", () => ({
  default: class MockDatabase {
    exec() {}
    prepare() {
      return {
        run() { return { changes: 0, lastInsertRowid: 0 } },
        get() {},
        all() { return [] },
        raw() {
          return {
            get() { return undefined },
            all() { return [] },
          }
        },
      }
    }
    pragma() {}
    close() {}
  },
}))
