/**
 * Environment-aware logger that suppresses detailed error messages in production
 * to prevent information disclosure via browser console.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
    } else {
      // Production: log generic message only, no error details
      console.error(message);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(message, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (isDev) {
      console.info(message, data);
    }
  },
  debug: (message: string, data?: unknown) => {
    if (isDev) {
      console.debug(message, data);
    }
  },
};
