import type { ThemePreference } from '../types'
import type { SVGProps } from 'react'
import { IconSun, IconMoon, IconSystem } from './icons'

export const themeLabels: Record<ThemePreference, string> = {
  system: 'System folgen',
  light: 'Lichtes Design',
  dark: 'Dunkles Design',
}

export const themeIcons: Record<
  ThemePreference,
  (props: SVGProps<SVGSVGElement>) => React.ReactNode
> = {
  system: IconSystem,
  light: IconSun,
  dark: IconMoon,
}
