import React, { useState, useEffect } from 'react';
import '../assets/styles/theme.scss';

const themes = [
  { id: 'theme-light', name: 'Light', color: '#ffffff' },
  { id: 'theme-dark', name: 'Dark', color: '#1a1a2e' },
  { id: 'theme-blue', name: 'Blue', color: '#3498db' },
  { id: 'theme-green', name: 'Green', color: '#27ae60' },
  { id: 'theme-purple', name: 'Purple', color: '#8e44ad' },
];

const ThemePage = () => {
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem('selectedTheme') || 'theme-light'
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme); // Apply theme globally
    localStorage.setItem('selectedTheme', activeTheme);
  }, [activeTheme]);

  return (
    <div className="theme-page">
      <h1>Choose a Theme</h1>
      <div className="theme-options">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-btn ${activeTheme === theme.id ? 'active' : ''}`}
            onClick={() => setActiveTheme(theme.id)}
            style={{ backgroundColor: theme.color }}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemePage;
