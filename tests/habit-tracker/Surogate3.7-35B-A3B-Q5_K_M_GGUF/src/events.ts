// --- Tiny pub/sub so the UI re-reads IndexedDB after every write ---

type Listener = () => void;
const listeners = new Set<Listener>();

export function notify(): void {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
