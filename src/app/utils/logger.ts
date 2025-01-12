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

  log(message: string, level: 'info' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    const logFile = path.join(this.logDir, `${level}.log`);
    
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage);
  }
}

export const logger = new Logger();
