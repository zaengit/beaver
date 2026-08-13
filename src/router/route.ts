import type { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"

type Session = { user: { id: string } } | null

export type AdminRoute = (context: {
  request: Request
  params: Record<string, string | undefined>
  cookies: {
    get(name: string): { value: string } | undefined
    set(name: string, value: string, options?: Record<string, unknown>): void
  }
  locals: { session: Session }
}) => Response | Promise<Response>

export function createAdminRouteContext(context: Context<{ Variables: { session: { user: { id: string } } } }>) {
  return {
    request: context.req.raw,
    params: context.req.param(),
    cookies: {
      get: (name: string) => {
        const value = getCookie(context, name)
        return value ? { value } : undefined
      },
      set: (name: string, value: string, options?: Record<string, unknown>) => {
        setCookie(context, name, value, options as Parameters<typeof setCookie>[3])
      },
    },
    locals: { session: context.get("session") ?? null },
  }
}
