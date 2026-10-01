interface SettingsScreenProps {
  onThemeToggle: () => void;
}

function SettingsScreen({ onThemeToggle }: SettingsScreenProps) {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span>Dunkler Modus</span>
          <button
            data-testid="theme-toggle"
            onClick={onThemeToggle}
            className="w-12 h-6 bg-gray-300 dark:bg-blue-500 rounded-full relative transition-colors"
          >
            <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform dark:translate-x-6"></span>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
        Rhythm v1.0 - Habit- und Stimmungs-Tracker
      </p>
    </div>
  );
}

export default SettingsScreen;
