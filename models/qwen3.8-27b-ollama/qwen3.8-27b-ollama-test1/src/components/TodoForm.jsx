import { useState } from 'react'
import { PlusIcon } from './icons.jsx'

// Controlled input + submit. The submit button is disabled while the field is
// blank, so you can never add an empty task. Focus stays in the input after a
// submit for fast, repeated entry.
export default function TodoForm({ onAdd }) {
   const [text, setText] = useState('')

   const submit = (event) => {
      event.preventDefault()
      const value = text.trim()
      if (!value) return
      onAdd(value)
      setText('')
   }

   return (
         <form className="add" onSubmit={submit}>
            <input
             className="add-input"
             type="text"
             value={text}
             onChange={(event) => setText(event.target.value)}
             placeholder="Was steht an?"
             maxLength={200}
             autoComplete="off"
             aria-label="Neue Aufgabe hinzufügen"
            />
            <button
             type="submit"
             className="add-btn"
             aria-label="Aufgabe hinzufügen"
             title="Aufgabe hinzufügen"
             disabled={!text.trim()}
            >
                <PlusIcon />
            </button>
         </form>
     )
}
