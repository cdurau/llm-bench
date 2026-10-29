import { useState } from 'react';
import { HABIT_COLORS, HABIT_EMOJIS } from '../lib/colors';
import type { StreakInfo } from '../lib/streaks';
import type { Habit } from '../lib/types';
import { IconCheck, IconPencil, IconTrash } from './icons';
import Reveal from './Reveal';

interface HabitCardProps {
  habit: Habit;
  done: boolean;
  streak: StreakInfo;
  editing: boolean;
  onToggle: (habitId: string) => void;
  onEdit: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({
  habit,
  done,
  streak,
  editing,
  onToggle,
  onEdit,
  onUpdate,
  onDelete,
}: HabitCardProps) {
  const [confirming, setConfirming] = useState(false);

  const cycleEmoji = (emoji: string) => {
    if (habit.emoji !== emoji) {
      onUpdate(habit.id, { emoji });
    }
  };

  return (
    <Reveal>
      <article className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]"
            style={{
              backgroundColor: `var(--habit-${habit.color}-soft)`,
              color: `var(--habit-${habit.color})`,
            }}
          >
            {habit.emoji}
          </div>
          {editing ? (
            <input
              type="text"
              value={habit.name}
              onChange={(e) => onUpdate(habit.id, { name: e.target.value })}
              aria-label="Habit Name"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-[15px] font-medium text-ink outline-none focus:border-b focus:border-ink"
            />
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink">{habit.name}</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {streak.current > 0
                  ? `Aktuell ${streak.current} · Beste ${streak.longest}`
                  : 'Noch nicht begonnen'}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            aria-pressed={done}
            aria-label={`${habit.name} heute ${done ? 'als erledigt markieren' : 'als offen markieren'}`}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              done ? 'border-accent bg-accent' : 'border-ink/15 bg-transparent'
            }`}
          >
            <IconCheck
              className={`h-5 w-5 transition-all duration-300 ${
                done ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            />
          </button>
          {editing ? null : (
            <button
              type="button"
              onClick={() => onEdit(habit.id)}
              aria-label={`Habit ${habit.name} bearbeiten`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <IconPencil className="h-5 w-5" />
            </button>
          )}
        </div>
        {editing ? (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">
                Emoji
              </p>
              <div className="flex flex-wrap gap-2">
                {HABIT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => cycleEmoji(emoji)}
                    aria-label={`Emoji ${emoji} wählen`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      habit.emoji === emoji
                        ? 'border-accent bg-accent-soft'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">
                Farbe
              </p>
              <div className="flex flex-wrap gap-2">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => onUpdate(habit.id, { color: c.key })}
                    aria-label={`Farbe ${c.key} wählen`}
                    aria-pressed={habit.color === c.key}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      habit.color === c.key ? 'scale-110' : 'scale-100'
                    }`}
                    style={{ backgroundColor: c.deep }}
                  >
                    {habit.color === c.key ? (
                      <IconCheck className="h-4 w-4 text-white" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirming) {
                  onDelete(habit.id);
                  setConfirming(false);
                } else {
                  setConfirming(true);
                }
              }}
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <IconTrash className="h-4 w-4" />
              {confirming ? 'Wirklich löschen' : 'Löschen'}
            </button>
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}