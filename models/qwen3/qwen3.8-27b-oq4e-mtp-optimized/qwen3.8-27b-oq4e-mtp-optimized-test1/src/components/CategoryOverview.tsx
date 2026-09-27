import type { CategoryStat } from '../state/store';

/** Einfache Übersicht nach Kategorie: Name, Fortschrittsbalken, Zähler. */
export function CategoryOverview({ stats }: { stats: CategoryStat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="cat" aria-label="Übersicht nach Kategorie">
      <h2 className="section__label">Nach Kategorie</h2>
      <ul className="cat__list">
        {stats.map((stat) => {
          const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
          return (
            <li key={stat.category} className="cat__row">
              <span className="cat__name" title={stat.category}>
                {stat.category}
              </span>
              <span
                className="cat__bar"
                role="img"
                aria-label={`${stat.category}: ${stat.done} von ${stat.total} erledigt`}
              >
                <span className="cat__fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="cat__count">
                {stat.done}/{stat.total}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
