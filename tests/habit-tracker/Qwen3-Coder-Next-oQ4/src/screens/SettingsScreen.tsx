import { useState, useEffect } from 'react';
import { useAppState } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';
import { getMoodEmoji } from '../lib/utils';

export function SettingsScreen() {
  const { appState, toggleDarkMode } = useAppState();
  const [darkMode, setDarkMode] = useState(appState.darkMode);
  const [mood, setMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    setDarkMode(appState.darkMode);
  }, [appState.darkMode]);

  const moodOptions = [1, 2, 3, 4, 5];

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>

      {/* Dark Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Dunkler Modus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dunkles Farbschema</span>
            <button
              onClick={toggleDarkMode}
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-300
                ${darkMode ? 'bg-gray-900' : 'bg-gray-300'}
              `}
            >
              <div className={`
                absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md
                transition-transform duration-300
                ${darkMode ? 'translate-x-5' : 'translate-x-0'}
              `} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Folgt dem System, manuell umschaltbar
          </p>
        </CardContent>
      </Card>

      {/* Stimmung Eintrag */}
      <Card>
        <CardHeader>
          <CardTitle>Stimmung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-3">Wie fühlst du dich heute?</Label>
              <div className="flex justify-between gap-2">
                {moodOptions.map((moodOption) => (
                  <button
                    key={moodOption}
                    onClick={() => setMood(moodOption)}
                    className={`
                      flex flex-col items-center gap-1
                      w-12 h-16 rounded-xl transition-all duration-200
                      ${mood === moodOption 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className="text-2xl">{getMoodEmoji(moodOption)}</span>
                    <span className="text-xs font-medium">{moodOption}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="moodNote">Notiz (optional)</Label>
              <Input
                id="moodNote"
                value={moodNote}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMoodNote(e.target.value)}
                placeholder="Kurze Notiz..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {moodNote.length}/100 Zeichen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Über Rhythm</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            Rhythm ist ein Habit- und Stimmungs-Tracker, der komplett lokal in deinem Browser
            läuft. Deine Daten werden in IndexedDB gespeichert und bleiben privat.
          </p>
          <p className="text-xs text-gray-500">
            Version 1.0.0 • Offline-fähig • IndexedDB
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
