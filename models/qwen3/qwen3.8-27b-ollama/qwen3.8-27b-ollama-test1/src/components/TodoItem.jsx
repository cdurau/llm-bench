import { useEffect, useRef, useState } from 'react'
import { CheckIcon, PencilIcon, TrashIcon } from './icons.jsx'

// A single task row: a round toggle, the text (also editable via double-click),
// and edit/delete actions. Actions stay visible at all times so they work on
// touch devices, not just on hover.
export default function TodoItem({ item, onToggle, onEdit, onDelete }) {
   const [editing, setEditing] = useState(false)
   const [draft, setDraft] = useState(item.text)
   const inputRef = useRef(null)

   useEffect(() => {
      if (editing && inputRef.current) {
         inputRef.current.focus()
         const len = inputRef.current.value.length
         requestAnimationFrame(() => inputRef.current?.setSelectionRange(len, len))
      }
    }, [editing])

   const startEdit = () => {
      setDraft(item.text)
      setEditing(true)
   }

   const cancel = () => {
      setDraft(item.text)
      setEditing(false)
   }

   const commit = () => {
      setEditing(false)
      const value = draft.trim()
      if (value !== item.text) onEdit(item.id, value)
   }

   const onKeyDown = (event) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         commit()
      } else if (event.key === 'Escape') {
         event.preventDefault()
         cancel()
      }
   }

   return (
          <li className={'todo' + (item.done ? ' is-done' : '')}>
            <button
              type="button"
              className="check"
              aria-pressed={item.done}
              aria-label={
                  item.done
                       ? `${item.text} als offen markieren`
                       : `${item.text} als erledigt markieren`
               }
              onClick={() => onToggle(item.id)}
             >
                  <CheckIcon size={16} />
             </button>

             {editing ? (
                <input
                  ref={inputRef}
                  className="edit-input"
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={commit}
                  onKeyDown={onKeyDown}
                  maxLength={200}
                  aria-label="Aufgabe bearbeiten"
                 />
              ) : (
                <span
                  className="todo-text"
                  onDoubleClick={startEdit}
                  title="Doppelklick zum Bearbeiten"
                 >
                    {item.text}
                 </span>
              )}

             <div className="todo-actions">
                <button
                  type="button"
                  className="icon-btn icon-btn--edit"
                  onClick={startEdit}
                  aria-label={`${item.text} bearbeiten`}
                  title="Bearbeiten"
                  tabIndex={editing ? -1 : 0}
                   hidden={editing}
                 >
                      <PencilIcon />
                   </button>
                   <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => onDelete(item.id)}
                    aria-label={`${item.text} löschen`}
                    title="Löschen"
                  >
                      <TrashIcon />
                    </button>
                 </div>
               </li>
            )
}
