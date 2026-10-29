interface UpdatePromptProps {
  needRefresh: boolean;
  onUpdate: () => void;
}

export default function UpdatePrompt({ needRefresh, onUpdate }: UpdatePromptProps) {
  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-medium">Eine neue Version ist verfügbar.</p>
      <p className="mt-1 text-sm text-muted">Rhythm wurde aktualisiert – bitte neu laden.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void onUpdate()}
          className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-medium text-canvas"
        >
          Aktualisieren
        </button>
        <button
          type="button"
          onClick={onUpdate}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-ink"
        >
          Später
        </button>
      </div>
    </div>
  );
}