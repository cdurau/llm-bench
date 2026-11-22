import { useState } from 'react';
import { MOOD_OPTIONS, type MoodValue } from '../lib/utils';

interface MoodSelectorProps {
  value?: MoodValue;
  onChange: (value: MoodValue) => void;
  disabled?: boolean;
}

export default function MoodSelector({ value, onChange, disabled }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {/* Selected Mood Display */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-16 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
          isOpen
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-surface border border-border hover:border-primary/50 hover:shadow-md'
        }`}
      >
        {value !== undefined && (
          <>
            <span className="text-3xl">{MOOD_OPTIONS.find(m => m.value === value)?.emoji}</span>
            <span className="font-semibold">{MOOD_OPTIONS.find(m => m.value === value)?.label}</span>
          </>
        )}
        {!value && !isOpen && (
          <span className="text-muted-foreground">Stimmung auswählen</span>
        )}
      </button>

      {/* Mood Options Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-xl shadow-xl p-3 z-20">
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => {
                    onChange(mood.value);
                    setIsOpen(false);
                  }}
                  disabled={disabled}
                  className={`h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                    value === mood.value
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-muted hover:text-primary'
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
