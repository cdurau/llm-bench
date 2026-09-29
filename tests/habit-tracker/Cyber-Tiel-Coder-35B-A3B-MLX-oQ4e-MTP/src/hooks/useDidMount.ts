import { useEffect, useState } from 'react'

/** True once the app has mounted, so we can skip enter animations on first paint. */
export function useDidMount(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
