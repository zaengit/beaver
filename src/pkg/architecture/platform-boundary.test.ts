import { spawnSync } from "node:child_process"
import path from "node:path"

import { describe, expect, it } from "vitest"

describe("platform boundaries", () => {
  it("does not keep an astro-specific library subtree", () => {
    const cwd = path.resolve(__dirname, "../../../../..")
    const result = spawnSync(
      "test",
      ["!", "-e", "packages/zadm/src/lib/astro"],
      {
        cwd,
      },
    )

    if (result.status !== 0) {
      throw new Error("src/lib/astro still exists")
    }
  })

  it("does not allow client code to import server-only auth or rbac modules", () => {
    const cwd = path.resolve(__dirname, "../../../../..")
    const result = spawnSync(
      "bash",
      [
        "-lc",
        "grep -r -n 'from \"zadm/app/auth\"' packages/zadm/src/ui/ || grep -r -n 'from \"zadm/pkg/security/rbac\"' packages/zadm/src/ui/ || true",
      ],
      {
        cwd,
        encoding: "utf8",
      },
    )

    expect(result.stdout.trim()).toBe("")
  })
})
