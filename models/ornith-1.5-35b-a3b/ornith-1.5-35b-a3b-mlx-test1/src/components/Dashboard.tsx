import type { CategoryStat, DaySummary } from '@/lib/dayLogic';

interface Props {
  summary: DaySummary;
  categories: CategoryStat[];
}

/** Fortschritts-Dashboard: vier Statistiken, Balken und Kategorie-Chips. */
export function Dashboard({ summary, categories }: Props) {
  return (
    <section className="card">
      <div className="dashboard">
        <div className="stat">
          <div className="value">{summary.done}</div>
          <div className="label">Erledigt</div>
        </div>
        <div className="stat">
          <div className="value">{summary.open}</div>
          <div className="label">Offen</div>
        </div>
        <div className="stat">
          <div className="value">{summary.total}</div>
          <div className="label">Gesamt</div>
        </div>
        <div className="stat">
          <div className="value">{summary.percent}%</div>
          <div className="label">Fortschritt</div>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={summary.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tagesfortschritt"
        >
          <div
            className="progress-fill"
            style={{ width: `${summary.percent}%` }}
          />
        </div>

        {categories.length > 0 && (
          <div className="categories">
            {categories.map((c) => (
              <span className="chip" key={c.category}>
                <strong>
                  {c.done}/{c.total}
                </strong>{' '}
                {c.category}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
