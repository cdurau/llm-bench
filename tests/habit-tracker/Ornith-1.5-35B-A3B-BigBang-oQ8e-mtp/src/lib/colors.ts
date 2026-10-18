export interface PaletteColor {
  value: string
  name: string
}

export const PALETTE: PaletteColor[] = [
  { value: "#4A6FA5", name: "Blaugrau" },
  { value: "#4E8C6E", name: "Grün" },
  { value: "#A68B5B", name: "Ocker" },
  { value: "#B55A5A", name: "Rosa" },
  { value: "#7B6B8A", name: "Violett" },
  { value: "#5C8A9B", name: "Türkis" },
  { value: "#8C7A6B", name: "Braun" },
  { value: "#6B8E5E", name: "Oliv" },
  { value: "#9B6E8A", name: "Fuchsia" },
  { value: "#5A7A9A", name: "Himmel" },
]

export const HABIT_EMOJIS = [
  "🏃", "🧘", "💪", "📚", "✍️", "🎸", "🎨", "💧",
  "🥗", "🏔️", "🧹", "💤", "📵", "🧠", "💰", "🌱",
  "🚴", "🧑‍🍳", "📖", "🤝", "🎯", "🧩", "🌿", "⌨️",
]

export function tint(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const tr = Math.round(r + (255 - r) * amount)
  const tg = Math.round(g + (255 - g) * amount)
  const tb = Math.round(b + (255 - b) * amount)
  return `rgb(${tr}, ${tg}, ${tb})`
}

export function withAlpha(hex: string, alpha: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
