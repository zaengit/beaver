export interface AstroLikeCookies {
  get(name: string): { value: string } | undefined
  set(name: string, value: string, options?: Record<string, unknown>): void
  delete?(name: string, options?: Record<string, unknown>): void
}
