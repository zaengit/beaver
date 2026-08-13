import { describe, it, expect } from "vitest"

describe("ulidRegex", () => {
  it("matches a valid ULID string", async () => {
    const { ulidRegex } = await import("./shared")
    // ULID: 26 chars from Crockford base32 (0-9, A-Z excluding I, L, O, U)
    expect(ulidRegex.test("01ARZ3NDEKTSV4RRFFQ69G5FAV")).toBe(true)
  })

  it("rejects lowercase ULID (regex is uppercase-only)", async () => {
    const { ulidRegex } = await import("./shared")
    expect(ulidRegex.test("01arz3ndektsv4rrffq69g5fav")).toBe(false)
  })

  it("rejects short string", async () => {
    const { ulidRegex } = await import("./shared")
    expect(ulidRegex.test("01ARZ3ND")).toBe(false)
  })

  it("rejects long string", async () => {
    const { ulidRegex } = await import("./shared")
    expect(ulidRegex.test("01ARZ3NDEKTSV4RRFFQ69G5FAVZZ")).toBe(false)
  })

  it("rejects empty string", async () => {
    const { ulidRegex } = await import("./shared")
    expect(ulidRegex.test("")).toBe(false)
  })
})

describe("slugRegex", () => {
  it("matches a simple slug", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("hello-world")).toBe(true)
  })

  it("matches single word", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("hello")).toBe(true)
  })

  it("matches slug with numbers", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("post-2024")).toBe(true)
  })

  it("rejects uppercase", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("Hello-World")).toBe(false)
  })

  it("rejects leading hyphen", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("-hello")).toBe(false)
  })

  it("rejects trailing hyphen", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("hello-")).toBe(false)
  })

  it("rejects consecutive hyphens", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("hello--world")).toBe(false)
  })

  it("rejects empty string", async () => {
    const { slugRegex } = await import("./shared")
    expect(slugRegex.test("")).toBe(false)
  })
})