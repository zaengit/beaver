import { describe, expect, it } from "vitest"

describe("cn", () => {
  it("returns a string for a single class", async () => {
    const { cn } = await import("./ui")
    expect(cn("bg-red-500")).toBe("bg-red-500")
  })

  it("merges multiple classes", async () => {
    const { cn } = await import("./ui")
    const result = cn("bg-red-500", "text-white", "p-4")
    expect(result).toContain("bg-red-500")
    expect(result).toContain("text-white")
    expect(result).toContain("p-4")
  })

  it("resolves conflicting tailwind classes (last wins via twMerge)", async () => {
    const { cn } = await import("./ui")
    const result = cn("p-2", "p-4")
    expect(result).toContain("p-4")
    expect(result).not.toContain("p-2")
  })

  it("handles conditional classes", async () => {
    const { cn } = await import("./ui")
    const result = cn("base", false && "hidden", undefined, "extra")
    expect(result).toContain("base")
    expect(result).toContain("extra")
    expect(result).not.toContain("hidden")
  })

  it("returns empty string for no inputs", async () => {
    const { cn } = await import("./ui")
    expect(cn()).toBe("")
  })
})