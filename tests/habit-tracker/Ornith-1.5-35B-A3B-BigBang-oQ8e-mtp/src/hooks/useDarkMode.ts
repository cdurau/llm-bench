import { useEffect, useState } from "react"

export type Appearance = "system" | "light" | "dark"

const KEY = "rhythm:appearance"

function readInitial(): Appearance {
  try {
    const stored = window.localStorage.getItem(KEY)
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored
    }
  } catch {
    /* ignore */
  }
  return "system"
}

function systemIsDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function useDarkMode() {
  const [appearance, setAppearanceState] = useState<Appearance>(readInitial)

  function setAppearance(value: Appearance) {
    setAppearanceState(value)
    try {
      window.localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const root = document.documentElement
    const wantsDark =
      appearance === "dark" || (appearance === "system" && systemIsDark())
    root.classList.toggle("dark", wantsDark)
    if (appearance === "light") root.classList.add("light")
    else root.classList.remove("light")
  }, [appearance])

  useEffect(() => {
    if (appearance !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      document.documentElement.classList.toggle("dark", media.matches)
    }
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [appearance])

  return { appearance, setAppearance }
}
