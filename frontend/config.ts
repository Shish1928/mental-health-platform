// The Gemini API key for AI chat responses
// TODO: This will be set as a secret in the backend, no need to configure here
export const geminiAPIKey = "";

// Supabase configuration for data storage and analytics
// TODO: Set these values in your backend secrets configuration
export const supabaseUrl = "";
export const supabaseAnonKey = "";

// Application configuration
export const appConfig = {
  // Default language for the application
  defaultLanguage: "en",
  
  // Available languages
  supportedLanguages: [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "es", name: "Español" },
  ],
  
  // Feature flags
  features: {
    voiceAssistant: true,
    anonymousMode: true,
    parentalControls: true,
    offlineMode: true,
    dataSync: true,
  },
  
  // Emergency contact configuration
  emergencyContacts: {
    enabled: true,
    defaultCountry: "US",
  },
  
  // Analytics and reporting
  analytics: {
    enabled: true,
    trackMoodLogs: true,
    trackSessionData: true,
    trackRiskAssessments: true,
  },
  
  // Data backup configuration
  backup: {
    autoBackup: true,
    backupInterval: "daily", // daily, weekly, monthly
    retentionPeriod: 90, // days
  },
};
