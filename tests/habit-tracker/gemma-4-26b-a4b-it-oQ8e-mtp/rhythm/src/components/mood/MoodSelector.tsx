import React from 'react';
import { type MoodLog } from '../../lib/db';
import { saveMoodLog } from '../../lib/services';

interface MoodSelectorProps {
  currentMood: MoodLog | undefined;
  onMoodChange: (mood: MoodLog | undefined) => void;
}

const MOODS = [
  { score: 1, emoji: '😢', label: 'Schlecht' },
  { score: 2, emoji: '😕', label: 'Nicht so' },
  { score: 3, emoji: '😐', label: 'Neutral' },
  { score: 4, emoji: '🙂', label: 'Gut' },
  { score: 5, emoji: '🤩', label: 'Super' },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onMoodChange }) => {
  const [note, setNote] = React.useState(currentMood?.note || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSelect = async (score: number) => {
    setIsSaving(true);
    const date = new Date().toISOString().split('T')[0];
    
    const newMood: MoodLog = {
      id: `${date}-mood`,
      date,
      score,
      note: note || undefined,
    };

    await saveMoodLog(newMood);
    onMoodChange(newMood);
    setIsSaving(false);
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Wie fühlst du dich heute?</h3>
        {currentMood && (
          <span className="text-sm text-[var(--text-muted)]">
            Gespeichert: {MOODS.find(m => m.score === currentMood.score)?.emoji}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center px-2">
        {MOODS.map((m) => (
          <button
            key={m.score}
            onClick={() => handleSelect(m.score)}
            disabled={isSaving}
            className={`flex flex-col items-center space-y-2 transition-transform active:scale-90 ${
              currentMood?.score === m.score ? 'scale-110' : ''
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className={`text-xs ${currentMood?.score === m.score ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Notiz (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Was war heute los?"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[80px] resize-none"
        />
      </div>

      <button
        onClick={() => handleSelect(currentMood?.score || 3)}
        disabled={isSaving}
        className="w-full btn-primary disabled:opacity-50"
      >
        {isSaving ? 'Speichert...' : 'Speichern'}
      </button>
    </div>
  );
};

export default MoodSelector;
