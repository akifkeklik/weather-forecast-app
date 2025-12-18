type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private readonly levels = { error: 0, warn: 1, info: 2, debug: 3 };

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, data, error } = entry;
    let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (data) output += ` | ${JSON.stringify(data)}`;
    if (error) output += ` | Error: ${error.message}`;
    return output;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    };

    const formatted = this.formatEntry(entry);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  error(message: string, data?: unknown, error?: Error): void {
    this.log('error', message, data, error);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);
