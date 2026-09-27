/** Leerer Zustand: Einladung zur ersten Aktivität, keine Stimmung, nur Richtung. */
export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <h2 className="empty__title">Noch keine Aktivitäten</h2>
      <p className="empty__text">
        Füge deine erste Aktivität hinzu – zum Beispiel „Morgens laufen“ oder
        „8 Gläser Wasser“.
      </p>
      <button type="button" className="btn btn--primary" onClick={onAdd}>
        Aktivität hinzufügen
      </button>
    </div>
  );
}
