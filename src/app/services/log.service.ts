import { Injectable } from '@angular/core';

enum LogLevel {
  DEBUG,
  WARN,
  ERROR,
}

interface LogEntry {
  level: LogLevel;
  message: any;
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  // TODO: Persist these.
  // TODO: Limit the length of the array.
  private logs: LogEntry[] = [];

  constructor() {}

  private saveLog(message: any, level: LogLevel) {
    this.logs.push({ message, level });
  }

  public log(message: any) {
    // this.saveLog(message, LogLevel.DEBUG);
    console.log(message);
  }

  public warn(message: any) {
    this.saveLog(message, LogLevel.WARN);
    console.warn(message);
  }

  public error(message: any) {
    this.saveLog(message, LogLevel.ERROR);
    console.error(message);
  }

  public downloadLogs() {
    const element = document.createElement('a');
    const filename = `LOGS-${new Date().toISOString()}`;
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(this.logs))
    );

    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
