import { test as base, expect } from '@playwright/test';
import { logger, LogLevel } from '../utils/logger';

type LoggingFixtures = {
  enableLogging: (level?: LogLevel) => void;
  disableLogging: () => void;
  getTestLogs: () => any[];
  exportTestLogs: (filename?: string) => string;
};

export const test = base.extend<LoggingFixtures>({
  enableLogging: async ({}, use) => {
    const enableLogging = (level: LogLevel = LogLevel.INFO) => {
      logger.setLogLevel(level);
    };
    await use(enableLogging);
  },

  disableLogging: async ({}, use) => {
    const disableLogging = () => {
      logger.setLogLevel(LogLevel.ERROR); // Only show errors
    };
    await use(disableLogging);
  },

  getTestLogs: async ({}, use) => {
    const getTestLogs = () => {
      return logger.getLogs();
    };
    await use(getTestLogs);
  },

  exportTestLogs: async ({}, use) => {
    const exportTestLogs = (filename?: string) => {
      return logger.exportLogs(filename);
    };
    await use(exportTestLogs);
  },
});

// Enhanced test with automatic logging
export const testWithLogging = test.extend<{}>({
  // Override the test function to add automatic logging
  test: async ({ test }, use) => {
    return async (name, fn) => {
      return test(name, async (args) => {
        const startTime = Date.now();
        logger.testStart(name);
        
        try {
          await fn(args);
          const duration = Date.now() - startTime;
          logger.testEnd(name, 'PASSED', duration);
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.testEnd(name, 'FAILED', duration);
          logger.error('TEST', `Test failed: ${name}`, { error: error.message });
          throw error;
        }
      });
    };
  },
});

export { expect } from '@playwright/test';
