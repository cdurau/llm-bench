import type { Activity } from '../lib/types';
import { IconCheck, IconMinus, IconPencil, IconTrash } from './icons';

interface ActivityRowProps {
  activity: Activity;
  /** Zählstand für den angezeigten Tag (0..target). */
  count: number;
  /** Erledigt = count erreicht das Tagesziel. */
  done: boolean;
  /** Künftiger Tag → Abhaken gesperrt. */
  future: boolean;
  onToggle: () => void;
  onDecrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Eine Zeile der Tagesliste: großer Toggle-Kreis (primäre Aktion), Name mit
 * optionaler Beschreibung, Zähl-Chip bei Tagesziel > 1, Edit-/Delete-Buttons.
 */
export function ActivityRow({
  activity,
  count,
  done,
  future,
  onToggle,
  onDecrement,
  onEdit,
  onDelete,
}: ActivityRowProps) {
  const target = Math.max(activity.target, 1);
  const counting = target > 1;

  let toggleLabel: string;
  if (done) {
    toggleLabel = counting
      ? `„${activity.name}“ ist erledigt – auf 0 zurücksetzen`
      : `„${activity.name}“ wieder offen machen`;
  } else if (counting) {
    toggleLabel = `Fortschritt für „${activity.name}“: ${count} von ${target} – abhaken`;
  } else {
    toggleLabel = `„${activity.name}“ abhaken`;
  }

  return (
    <li className="row">
      <button
        type="button"
        className={`row__check${done ? ' is-done' : ''}`}
        aria-pressed={done}
        aria-label={toggleLabel}
        disabled={future}
        onClick={onToggle}
      >
        {done ? (
          <IconCheck size={13} />
        ) : counting && count > 0 ? (
          <span className="row__count-num">{count}</span>
        ) : null}
      </button>

      <div className="row__main">
        <span className={`row__name${done ? ' is-done' : ''}`}>{activity.name}</span>
        {activity.description !== '' && (
          <span className="row__desc">{activity.description}</span>
        )}
      </div>

      {counting && <span className="row__chip" aria-hidden="true">{count}/{target}</span>}

      <span className="row__actions">
        {count > 0 && !future && (
          <button
            type="button"
            className="iconbtn"
            onClick={onDecrement}
            aria-label={`Einen Abhak-Schritt für „${activity.name}“ rückgängig machen`}
            title="Einen Schritt rückgängig"
          >
            <IconMinus />
          </button>
        )}
        <button
          type="button"
          className="iconbtn"
          onClick={onEdit}
          aria-label={`„${activity.name}“ bearbeiten`}
        >
          <IconPencil />
        </button>
        <button
          type="button"
          className="iconbtn iconbtn--danger"
          onClick={onDelete}
          aria-label={`„${activity.name}“ löschen`}
        >
          <IconTrash />
        </button>
      </span>
    </li>
  );
}
