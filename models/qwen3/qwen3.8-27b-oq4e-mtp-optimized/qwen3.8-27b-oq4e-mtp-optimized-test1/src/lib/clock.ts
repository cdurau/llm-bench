/**
 * Zentrale Uhr: alle Datumsfunktionen fragen `now()` ab. Tests setzen per
 * `setClock()` ein festes Datum und erhalten so deterministische Tests,
 * ohne Fake-Timer (die z. B. user-event brechen würden).
 */
let override: Date | null = null;

export function setClock(date: Date | null): void {
  override = date;
}

export function now(): Date {
  return override ?? new Date();
}
