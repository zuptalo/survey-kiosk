// Application configuration
// These values can be overridden via environment variables at build time

export const APP_CONFIG = {
  // Application name - can be customized per deployment
  name: import.meta.env.VITE_APP_NAME || 'Zuptalo',

  // Short name for limited space contexts
  shortName: import.meta.env.VITE_APP_SHORT_NAME || 'Zuptalo',
};

export default APP_CONFIG;
