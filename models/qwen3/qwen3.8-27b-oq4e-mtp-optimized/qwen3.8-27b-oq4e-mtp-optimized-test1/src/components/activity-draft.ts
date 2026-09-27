import type { Activity } from '../lib/types';

/** Rohform des Aktivitäts-Formulars (vor Validierung/Normalisierung). */
export interface ActivityDraft {
  name: string;
  description: string;
  category: string;
  /** Ganzzahl ≥ 1; `null` = kein Ziel eingegeben → 1. */
  target: number | null;
}

export function emptyDraft(): ActivityDraft {
  return { name: '', description: '', category: '', target: null };
}

export function draftFromActivity(activity: Activity): ActivityDraft {
  return {
    name: activity.name,
    description: activity.description,
    category: activity.category,
    target: activity.target,
  };
}
