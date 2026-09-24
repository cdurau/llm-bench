import React, { useState } from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  newActivityName: string;
  setNewActivityName: (name: string) => void;
  onAddActivity: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, newActivityName, setNewActivityName, onAddActivity }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddActivity();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">PulseBoard</h1>
        <div className="header-actions">
          <button 
            className="toggle-dark-mode"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      
      <div className="add-activity">
        <input
          type="text"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add new activity"
          className="activity-input"
        />
        <button 
          onClick={onAddActivity}
          className="add-button"
          aria-label="Add activity"
        >
          + Add
        </button>
      </div>
    </header>
  );
};

export default Header;