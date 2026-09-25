import type { Activity } from '../types'
import { CheckIcon, EditIcon } from './icons'

interface ActivityItemProps {
  activity: Activity
  completedCount: number
  isCompleted: boolean
  isFuture: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

/** Eine einzelne Aktivitätszeile mit Zähler und Aktionsknöpfen. */
export function ActivityItem({
  activity,
  completedCount,
  isCompleted,
  isFuture,
  onToggle,
  onEdit,
  onDelete,
}: ActivityItemProps) {
  const target = activity.dailyTarget > 0 ? activity.dailyTarget : null

  const statusText = isFuture
    ? 'Zukünftiger Tag'
    : target
      ? `${completedCount} / ${target}`
      : completedCount > 0
        ? 'Erledigt'
        : 'Offen'

  return (
    <li className="activity" data-completed={isCompleted || undefined} aria-label={activity.name}>
      <button
        type="button"
        className={`activity__check${isCompleted ? ' is-done' : ''}`}
        onClick={onToggle}
        disabled={isFuture}
        aria-pressed={isCompleted}
        aria-label={`"${activity.name}" für ${statusText} umsetzen`}
        title={statusText}
      >
        {isCompleted && <CheckIcon />}
      </button>

      <div className="activity__main" onClick={onEdit} style={{ cursor: 'pointer' }}>
        <div className="activity__name" aria-hidden="true">
          {activity.name}
        </div>
        <div className="activity__meta">
          <span className="badge">{activity.category}</span>
          {activity.description && <span className="activity__desc">{activity.description}</span>}
        </div>
      </div>

      <div className="activity__counter" aria-hidden="true">
        {target ? (
          <span className="activity__target">
            {completedCount}/{target}
          </span>
        ) : null}
      </div>

      <div className="activity__actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onEdit}
          aria-label={`"${activity.name}" bearbeiten`}
          title="Bearbeiten"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={onDelete}
          aria-label={`"${activity.name}" löschen`}
          title="Löschen"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </li>
  )
}
