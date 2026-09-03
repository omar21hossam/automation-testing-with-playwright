/**
 * Internal logger utilities shared by the library modules.
 */
import type { SmartLocatorLogger } from './types';

/** Logger implementation used when a consumer does not provide one. */
export const noopLogger: SmartLocatorLogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  action: () => undefined,
  assertion: () => undefined,
  locatorResolved: () => undefined,
  locatorFailed: () => undefined,
};

/**
 * Fills missing logger methods with no-op implementations.
 *
 * @param logger Partial consumer logger.
 * @returns A logger with every required method available.
 */
export function createLogger(logger?: Partial<SmartLocatorLogger>): SmartLocatorLogger {
  return { ...noopLogger, ...logger };
}
