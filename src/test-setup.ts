import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

vi.mock("better-sqlite3", () => ({
  default: class MockDatabase {
    exec() {}
    prepare() {
      return { run() {}, get() {}, all() { return [] } }
    }
    pragma() {}
    close() {}
  },
}))
