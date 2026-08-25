import { useEffect, useState } from "react"
import { AdminApp as BeaverAdminApp } from "@zbeaver/beaver/ui"

interface RegistryPayload {
  contentTypeRegistry: unknown
  sectionRegistry: unknown
  menuGroupRegistry: unknown
}

interface RegistryGlobals {
  __CMS_CONTENT_TYPE_REGISTRY__?: unknown
  __CMS_SECTION_REGISTRY__?: unknown
  __CMS_MENU_GROUP_REGISTRY__?: unknown
}

function setRegistryGlobals(payload: RegistryPayload) {
  const globals = globalThis as typeof globalThis & RegistryGlobals
  globals.__CMS_CONTENT_TYPE_REGISTRY__ = payload.contentTypeRegistry
  globals.__CMS_SECTION_REGISTRY__ = payload.sectionRegistry
  globals.__CMS_MENU_GROUP_REGISTRY__ = payload.menuGroupRegistry
}

export function AdminApp() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    let active = true

    fetch("/api/registry", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Registry request failed (${response.status})`)
        return response.json() as Promise<RegistryPayload>
      })
      .then((payload) => {
        if (!active) return
        setRegistryGlobals(payload)
        setStatus("ready")
      })
      .catch(() => {
        if (active) setStatus("error")
      })

    return () => {
      active = false
    }
  }, [])

  if (status === "error") {
    return <p className="p-6 text-sm text-destructive">Unable to load registry configuration.</p>
  }

  if (status === "loading") {
    return <p className="p-6 text-sm text-muted-foreground">Loading admin configuration…</p>
  }

  return <BeaverAdminApp />
}
