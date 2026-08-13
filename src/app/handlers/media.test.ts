import { describe, expect, it, vi } from "vitest"

vi.mock("zadm/app/db", () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({})), limit: vi.fn(() => ({})), offset: vi.fn(() => ({})), orderBy: vi.fn(() => ({})), all: vi.fn(() => []), get: vi.fn(() => null) })), })),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => []) }) ) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => []) })) })) })),
    delete: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => []) })) })),
    run: vi.fn(),
  },
}))

describe("app/handlers/media", () => {
  it("module loads", async () => {
    const mod = await import("./media")
    expect(mod).toBeDefined()
  })
})
