import { useState } from 'react';
import { useAppState } from '../context';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';
import { Plus } from 'lucide-react';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪳', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🦞', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈'];
type Color = 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'indigo' | 'violet' | 'pink';
const COLORS: Color[] = ['red', 'orange', 'amber', 'green', 'teal', 'blue', 'indigo', 'violet', 'pink'];

export function HabitManager() {
  const { addHabit } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState<Color>(COLORS[5]);

  if (!showForm) {
    return (
      <div className="text-center py-8 px-4 animate-in fade-in duration-300">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
          <Plus size={40} className="text-gray-400" />
        </div>
        <p className="text-gray-600 mb-6">Füge deine ersten Gewohnheiten hinzu, um zu starten.</p>
        <Button variant="primary" onClick={() => setShowForm(true)} className="w-full">
          + Habit hinzufügen
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Habit erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="z.B. Morgens dehnen"
              autoFocus
            />
          </div>

          <div>
            <Label>Emoji</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center text-xl
                    ${emoji === e ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                  `}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Farbe</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`
                    w-8 h-8 rounded-full border-2
                    ${color === c ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300' : 'border-transparent'}
                  `}
                  style={{
                    backgroundColor: 
                      c === 'red' ? '#fee2e2' :
                      c === 'orange' ? '#ffedd5' :
                      c === 'amber' ? '#fef3c7' :
                      c === 'green' ? '#d1fae5' :
                      c === 'teal' ? '#ccfbf1' :
                      c === 'blue' ? '#dbeafe' :
                      c === 'indigo' ? '#e0e7ff' :
                      c === 'violet' ? '#ede9fe' :
                      '#fce7f3'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (name.trim()) {
                  addHabit({
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    emoji,
                    color,
                    createdAt: Date.now(),
                  });
                  setShowForm(false);
                  setName('');
                }
              }}
              className="flex-1"
            >
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
