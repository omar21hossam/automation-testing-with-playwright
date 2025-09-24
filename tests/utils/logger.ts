import { Page } from '@playwright/test';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  testName?: string;
  stepNumber?: number;
}

export class TestLogger {
  private static instance: TestLogger;
  private logs: LogEntry[] = [];
  private currentTestName: string = '';
  private stepCounter: number = 0;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  static getInstance(): TestLogger {
    if (!TestLogger.instance) {
      TestLogger.instance = new TestLogger();
    }
    return TestLogger.instance;
  }

  setTestName(testName: string) {
    this.currentTestName = testName;
    this.stepCounter = 0;
    this.log(LogLevel.INFO, 'TEST', `Starting test: ${testName}`);
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private log(level: LogLevel, category: string, message: string, details?: any) {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      testName: this.currentTestName,
      stepNumber: this.stepCounter
    };

    this.logs.push(entry);
    this.printLog(entry);
  }

  private printLog(entry: LogEntry) {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const levelStr = LogLevel[entry.level];
    const stepStr = entry.stepNumber ? `[Step ${entry.stepNumber}]` : '';
    const testStr = entry.testName ? `[${entry.testName}]` : '';
    
    console.log(
      `\x1b[90m${timestamp}\x1b[0m ` +
      `\x1b[${this.getColorForLevel(entry.level)}m[${levelStr}]\x1b[0m ` +
      `\x1b[36m[${entry.category}]\x1b[0m ` +
      `\x1b[33m${stepStr}\x1b[0m ` +
      `\x1b[32m${testStr}\x1b[0m ` +
      `${entry.message}`
    );

    if (entry.details) {
      console.log(`\x1b[90m  Details: ${JSON.stringify(entry.details, null, 2)}\x1b[0m`);
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '37'; // White
      case LogLevel.INFO: return '32';  // Green
      case LogLevel.WARN: return '33';  // Yellow
      case LogLevel.ERROR: return '31'; // Red
      default: return '37';
    }
  }

  // Public logging methods
  debug(category: string, message: string, details?: any) {
    this.log(LogLevel.DEBUG, category, message, details);
  }

  info(category: string, message: string, details?: any) {
    this.log(LogLevel.INFO, category, message, details);
  }

  warn(category: string, message: string, details?: any) {
    this.log(LogLevel.WARN, category, message, details);
  }

  error(category: string, message: string, details?: any) {
    this.log(LogLevel.ERROR, category, message, details);
  }

  // Step tracking methods
  step(stepName: string, details?: any) {
    this.stepCounter++;
    this.info('STEP', `Step ${this.stepCounter}: ${stepName}`, details);
  }

  action(action: string, target: string, details?: any) {
    this.info('ACTION', `${action} on ${target}`, details);
  }

  assertion(assertion: string, expected: any, actual?: any) {
    this.info('ASSERT', assertion, { expected, actual });
  }

  locatorResolved(primary: string, fallback: string, success: boolean) {
    if (success) {
      this.debug('LOCATOR', `Resolved: ${primary}`, { fallback });
    } else {
      this.warn('LOCATOR', `Primary failed, trying fallback: ${fallback}`, { primary });
    }
  }

  locatorFailed(selectors: string[]) {
    this.error('LOCATOR', `All selectors failed`, { selectors });
  }

  // Page object methods
  pageAction(pageName: string, method: string, params?: any) {
    this.info('PAGE', `${pageName}.${method}()`, params);
  }

  navigation(url: string) {
    this.info('NAVIGATION', `Navigating to: ${url}`);
  }

  formFill(formName: string, field: string, value: string) {
    this.info('FORM', `Filling ${formName}.${field} with: ${value}`);
  }

  // Test lifecycle methods
  testStart(testName: string) {
    this.setTestName(testName);
    this.info('TEST', `Test started: ${testName}`);
  }

  testEnd(testName: string, result: 'PASSED' | 'FAILED', duration?: number) {
    this.info('TEST', `Test ${result}: ${testName}`, { duration: duration ? `${duration}ms` : undefined });
  }

  // Utility methods
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByTest(testName: string): LogEntry[] {
    return this.logs.filter(log => log.testName === testName);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(filename?: string): string {
    const logsJson = JSON.stringify(this.logs, null, 2);
    if (filename) {
      require('fs').writeFileSync(filename, logsJson);
    }
    return logsJson;
  }

  // Performance tracking
  private timers: Map<string, number> = new Map();

  startTimer(name: string) {
    this.timers.set(name, Date.now());
    this.debug('TIMER', `Started timer: ${name}`);
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.warn('TIMER', `Timer not found: ${name}`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    this.debug('TIMER', `Timer ended: ${name}`, { duration: `${duration}ms` });
    return duration;
  }
}

// Export singleton instance
export const logger = TestLogger.getInstance();
