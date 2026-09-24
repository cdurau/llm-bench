import { ThemeToggle } from './ThemeToggle'

/** Kopfzeile mit App-Name und Theme-Umschalter. */
export function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo" aria-hidden="true">
          <span className="header__dot" />
        </div>
        <div>
          <h1 className="header__title">PulseBoard</h1>
          <p className="header__subtitle">Deine ruhige Tagesübersicht</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  )
}
