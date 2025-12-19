import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    appName: 'Zuptalo', // Default fallback
    thankYouCountdown: 5,
    inactivityTimeout: 30,
    loading: true
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/config');
        setConfig({
          ...response.data,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch config:', error);
        // Keep defaults if fetch fails
        setConfig(prev => ({ ...prev, loading: false }));
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigContext;
