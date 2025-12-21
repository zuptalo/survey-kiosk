import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default theme is 'dark'
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('app-theme', theme);

    // Update theme-color meta tag for PWA title bar
    const themeColors = {
      dark: '#1a1a1a',
      cafe: '#6b4423',
      green: '#3d7a3d',
      blue: '#2878b5',
      bright: '#ffffff',
      purple: '#7b3f9f'
    };

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColors[theme] || themeColors.dark);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes: {
      dark: { name: 'Dark', description: 'Dark mode for low light' },
      cafe: { name: 'Café', description: 'Warm coffee tones' },
      green: { name: 'Green', description: 'Natural green palette' },
      blue: { name: 'Blue', description: 'Ocean and sky blues' },
      purple: { name: 'Purple', description: 'Royal purple tones' },
      bright: { name: 'Bright', description: 'Clean and vibrant' }
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
