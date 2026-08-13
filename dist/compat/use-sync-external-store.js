import { useSyncExternalStore as reactUseSyncExternalStore, useCallback, useRef } from "react"

export const useSyncExternalStore = reactUseSyncExternalStore

export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual
) {
  const lastRenderedIsEqual = useRef(isEqual)
  const lastSelectedState = useRef(undefined)

  const getSelectedSnapshot = useCallback(() => {
    const slice = selector(getSnapshot())
    if (lastSelectedState.current !== undefined && isEqual && lastRenderedIsEqual.current) {
      if (isEqual(lastSelectedState.current, slice)) {
        return lastSelectedState.current
      }
    }
    lastSelectedState.current = slice
    return slice
  }, [getSnapshot, selector, isEqual])

  return reactUseSyncExternalStore(
    subscribe,
    getSelectedSnapshot,
    getServerSnapshot ? () => selector(getServerSnapshot()) : getSelectedSnapshot
  )
}