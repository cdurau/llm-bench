import { SunIcon, MoonIcon } from './icons.jsx'

// A single toggle button. It shows the icon for the mode you'll switch *to*
// (sun in dark mode, moon in light mode), with an accessible label.
export default function ThemeToggle({ theme, onToggle }) {
   const isDark = theme === 'dark'
   return (
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggle}
          aria-pressed={isDark}
          aria-label={
             isDark ? 'Zu hellem Design wechseln' : 'Zu dunklem Design wechseln'
          }
          title={isDark ? 'Helles Design' : 'Dunkles Design'}
        >
           {isDark ? <SunIcon /> : <MoonIcon />}
           <span className="sr-only">{isDark ? 'Helles Design' : 'Dunkles Design'}</span>
        </button>
    )
}
