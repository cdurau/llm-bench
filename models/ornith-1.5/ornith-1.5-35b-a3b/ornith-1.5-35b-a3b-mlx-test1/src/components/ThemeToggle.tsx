import { useTheme } from '@/hooks/useTheme';

/** Schaltet zwischen hellem und dunklem Modum (Kopfzeilen-Symbol). */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={
        isDark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'
      }
      aria-pressed={isDark}
      onClick={toggle}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1v2M12 21v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M1 12h2M21 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="12" r="5" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
