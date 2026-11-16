import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Requirement: Default to Bright / Light Mode whenever a new user opens the website
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeehouse_theme');
      // Only use dark if the user explicitly previously toggled to 'dark'
      if (saved === 'dark') {
        return 'dark';
      }
      // Default to Light/Bright mode for all new visitors
      return 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist choice
    try {
      localStorage.setItem('coffeehouse_theme', theme);
    } catch (e) {
      // Storage error safeguard
    }

    // Update browser address bar meta theme-color smoothly
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#120804' : '#FFFFFF');
    }
  }, [theme]);

  // Smooth instant toggle without refreshing
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
