import winston from "winston";

// Helper function to log events
export const logEvent = (level: keyof typeof winston.config.npm.levels, message: string) => {
    window.electronAPI.logEvent(level, message);
  };