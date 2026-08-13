export type NavigationParamValue =
  | string
  | number
  | boolean
  | null
  | undefined

export type NavigationParams =
  | URLSearchParams
  | Record<string, NavigationParamValue>

function shouldIncludeParam(value: NavigationParamValue) {
  return value !== null && value !== undefined && value !== "" && value !== "all"
}

export function buildNavigationUrl(pathname: string, params?: NavigationParams) {
  if (!params) {
    return pathname
  }

  const searchParams =
    params instanceof URLSearchParams
      ? new URLSearchParams(params.toString())
      : new URLSearchParams()

  if (!(params instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(params)) {
      if (shouldIncludeParam(value)) {
        searchParams.set(key, String(value))
      }
    }
  }

  const query = searchParams.toString()
  return query ? `${pathname}?${query}` : pathname
}

type NavigateFunction = (url: string, options?: { replace?: boolean }) => void

let globalNavigator: NavigateFunction | null = null

export function setGlobalNavigator(navigator: NavigateFunction | null) {
  globalNavigator = navigator
}

export function navigateTo(url: string, options?: { replace?: boolean }) {
  if (globalNavigator) {
    globalNavigator(url, options)
    return
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin || "http://localhost"
    const nextUrl = new URL(url, origin)

    if (
      nextUrl.origin === origin &&
      nextUrl.pathname.startsWith("/admin") &&
      typeof window.history?.pushState === "function" &&
      typeof window.dispatchEvent === "function"
    ) {
      const target = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const currentState = window.history.state ?? {}
      const currentIdx =
        typeof currentState.idx === "number" ? currentState.idx : 0
      const nextState = {
        ...currentState,
        idx: options?.replace ? currentIdx : currentIdx + 1,
      }
      if (options?.replace) {
        window.history.replaceState(nextState, "", target)
      } else {
        window.history.pushState(nextState, "", target)
      }
      window.dispatchEvent(new PopStateEvent("popstate", { state: nextState }))
      return
    }

    window.location.assign(url)
  }
}

export function navigateToPath(pathname: string, params?: NavigationParams) {
  navigateTo(buildNavigationUrl(pathname, params))
}

export function getCurrentSearchParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams()
  }

  return new URLSearchParams(window.location.search)
}

export function reloadPage() {
  if (typeof window !== "undefined") {
    window.location.reload()
  }
}
