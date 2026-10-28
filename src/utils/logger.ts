type LogContext = Record<string, unknown>;

function write(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const entry = context ? { message, ...context } : { message };
  console[level]('[Pretium]', entry);
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (import.meta.env.DEV) write('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    write('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    write('error', message, context);
  },
};
