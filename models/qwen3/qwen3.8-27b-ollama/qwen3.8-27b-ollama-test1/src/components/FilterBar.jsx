const FILTERS = [
   { id: 'all', label: 'Alle' },
   { id: 'active', label: 'Offen' },
   { id: 'done', label: 'Erledigt' },
]

// A small group of toggle buttons. Each is a real, focusable control with an
// aria-pressed state, so it works with keyboard, touch, and screen readers.
export default function FilterBar({ filter, onFilter }) {
   return (
         <div className="filters" role="group" aria-label="Aufgaben filtern">
            {FILTERS.map((f) => (
                <button
                 key={f.id}
                 type="button"
                 className={filter === f.id ? 'filter is-active' : 'filter'}
                 aria-pressed={filter === f.id}
                 onClick={() => onFilter(f.id)}
                >
                   {f.label}
                </button>
             ))}
         </div>
     )
}
