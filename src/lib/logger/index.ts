import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

// Log levels
export const LogLevel = {
	VERBOSE: 0,
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4,
	FATAL: 5
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

// Log format
interface LogEntry {
	timestamp: string;
	level: string;
	message: string;
	details?: Record<string, unknown>;
	context?: {
		ip?: string;
		userAgent?: string;
		userId?: number;
		path?: string;
		method?: string;
	};
}

// Color mapping for console output
const colors = {
	VERBOSE: '\x1b[36m',
	DEBUG: '\x1b[34m',
	INFO: '\x1b[32m',
	WARN: '\x1b[33m',
	ERROR: '\x1b[31m',
	FATAL: '\x1b[35m'
};

const resetColor = '\x1b[0m';

// Logger class
class Logger {
	private minLevel: LogLevel;

	constructor(minLevel: LogLevel = LogLevel.INFO) {
		this.minLevel = minLevel;
	}

	private formatTimestamp(): string {
		return new Date().toISOString();
	}

	private formatLevel(level: LogLevel): string {
		const levels = ['VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
		return levels[level] || 'UNKNOWN';
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.minLevel;
	}

	private buildLogEntry(
		level: LogLevel,
		message: string,
		details?: Record<string, unknown>,
		context?: LogEntry['context']
	): LogEntry {
		return {
			timestamp: this.formatTimestamp(),
			level: this.formatLevel(level),
			message,
			details,
			context
		};
	}

	private formatForConsole(entry: LogEntry): string {
		const { timestamp, level, message, details, context } = entry;
		const color = colors[level as keyof typeof colors];
		const reset = resetColor;

		let output = `${color}[${timestamp}] [${level}] ${message}${reset}`;

		if (context) {
			const ctxParts: string[] = [];
			if (context.ip) ctxParts.push(`ip=${context.ip}`);
			if (context.userId) ctxParts.push(`userId=${context.userId}`);
			if (context.path) ctxParts.push(`path=${context.path}`);
			if (ctxParts.length > 0) {
				output += ` ${color}(${ctxParts.join(', ')})${reset}`;
			}
		}

		if (details && Object.keys(details).length > 0) {
			output += ` ${color}${JSON.stringify(details)}${reset}`;
		}

		return output;
	}

	private formatForFile(entry: LogEntry): string {
		const { timestamp, level, message, details, context } = entry;
		const ctx = context ? JSON.stringify(context) : '{}';
		const det = details ? JSON.stringify(details) : '{}';
		return JSON.stringify({ timestamp, level, message, context: ctx, details: det });
	}

	private log(
		level: LogLevel,
		message: string,
		details?: Record<string, unknown>,
		context?: LogEntry['context']
	): void {
		if (!this.shouldLog(level)) return;

		const entry = this.buildLogEntry(level, message, details, context);

		// Console output (colored)
		if (dev) {
			console.log(this.formatForConsole(entry));
		} else {
			// Production: simple console output
			console.log(this.formatForFile(entry));
		}

		// File output (production only)
		if (!dev && env.LOG_FILE_PATH) {
			try {
				const fs = await import('fs');
				const path = await import('path');
				const logDir = path.dirname(env.LOG_FILE_PATH);

				if (!fs.existsSync(logDir)) {
					fs.mkdirSync(logDir, { recursive: true });
				}

				const logEntry = this.formatForFile(entry) + '\n';
				fs.appendFileSync(env.LOG_FILE_PATH, logEntry);
			} catch (err) {
				console.error('Failed to write log file:', err);
			}
		}
	}

	// Public methods
	verbose(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.VERBOSE, message, details, context);
	}

	debug(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.DEBUG, message, details, context);
	}

	info(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.INFO, message, details, context);
	}

	warn(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.WARN, message, details, context);
	}

	error(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.ERROR, message, details, context);
	}

	fatal(message: string, details?: Record<string, unknown>, context?: LogEntry['context']): void {
		this.log(LogLevel.FATAL, message, details, context);
	}

	// Helper methods
	withContext(context: LogEntry['context']): Logger {
		return new Logger(this.minLevel);
	}

	errorWithStack(message: string, error: Error, context?: LogEntry['context']): void {
		const details = {
			name: error.name,
			message: error.message,
			stack: error.stack?.split('\n').slice(0, 5).join('\n')
		};
		this.log(LogLevel.ERROR, message, details, context);
	}
}

// Create singleton instance
const logger = new Logger(
	dev ? LogLevel.DEBUG : (LogLevel.INFO as LogLevel)
);

export default logger;
