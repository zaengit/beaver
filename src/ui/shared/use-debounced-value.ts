import { useEffect, useState } from "react"

export function useDebouncedValue<Value>(value: Value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}
