import React, { useState, useEffect } from 'react';
import '../assets/styles/theme.scss';
import { Link } from 'react-router-dom';


const themes = [
  { id: 'theme-light', name: 'Light', color: 'rgb(243 240 240)' },
  { id: 'theme-dark', name: 'Dark', color: 'rgb(87 87 87)' },
  { id: 'theme-blue', name: 'Blue', color: '#3498db' },
  { id: 'theme-green', name: 'Green', color: 'rgb(109 193 144)' },
  { id: 'theme-purple', name: 'Purple', color: '#d69bbd' },
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
      <div className='nav-theme'> <div className="nav-2">  <Link to="/todos" className='nav-2-center'>Return to your todos</Link> </div> </div>
      <h1>Theme</h1>

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
