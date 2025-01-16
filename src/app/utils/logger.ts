import fs from 'fs';
import path from 'path';

export class Logger {
  private logDir: string;
  
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private getCallerDetails(): string {
    const error = new Error();
    const stack = error.stack?.split('\n')[3];
    const caller = stack?.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || 
                  stack?.match(/at\s+()(.*):(\d+):(\d+)/);
    return caller ? `[${caller[1] || 'anonymous'}]` : '[unknown]';
  }

  private writeLog(message: string, level: string) {
    const timestamp = new Date().toISOString();
    const caller = this.getCallerDetails();
    const logMessage = `[${timestamp}] [${level}] ${caller} ${message}\n`;
    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage);
  }

  info(message: string) {
    this.writeLog(message, 'INFO');
  }

  error(message: string) {
    this.writeLog(message, 'ERROR');
  }

  warning(message: string) {
    this.writeLog(message, 'WARNING');
  }
}

export const logger = new Logger();