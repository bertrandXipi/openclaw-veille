export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
}

export function log(entry: Omit<LogEntry, 'timestamp'>): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  
  console.log(JSON.stringify(logEntry));
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => 
    log({ level: 'info', message, context }),
  
  warn: (message: string, context?: Record<string, unknown>) => 
    log({ level: 'warn', message, context }),
  
  error: (message: string, context?: Record<string, unknown>) => 
    log({ level: 'error', message, context }),
  
  debug: (message: string, context?: Record<string, unknown>) => 
    log({ level: 'debug', message, context }),
};
