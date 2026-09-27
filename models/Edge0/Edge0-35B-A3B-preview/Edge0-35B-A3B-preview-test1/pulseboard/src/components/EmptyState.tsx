export function EmptyState({ message = 'Noch keine Daten vorhanden.', sub = 'Füge deine erste Aktivität hinzu.' }: { message?: string; sub?: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      <p>{sub}</p>
    </div>
  );
}
