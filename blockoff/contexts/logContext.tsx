import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any[];
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (level: LogLevel, ...args: any[]) => void;
  clearLogs: () => void;
  getLogsAsText: () => string;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

interface LogProviderProps {
  children: ReactNode;
  maxLogs?: number;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children, maxLogs = 1000 }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdCounter = useRef(0);

  const addLog = (level: LogLevel, ...args: any[]) => {
    const timestamp = Date.now();
    const id = `log-${timestamp}-${logIdCounter.current++}`;
    
    // Convert all arguments to strings
    const message = args
      .map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const newLog: LogEntry = {
      id,
      timestamp,
      level,
      message,
      data: args.length > 1 ? args : undefined,
    };

    setLogs(prevLogs => {
      const updated = [newLog, ...prevLogs];
      // Keep only the last maxLogs entries
      return updated.slice(0, maxLogs);
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogsAsText = (): string => {
    return logs
      .map(log => {
        const date = new Date(log.timestamp).toISOString();
        return `[${date}] [${log.level.toUpperCase()}] ${log.message}`;
      })
      .join('\n');
  };

  // Intercept console methods
  useEffect(() => {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.info = (...args: any[]) => {
      originalInfo(...args);
      addLog('info', ...args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.debug = (...args: any[]) => {
      originalDebug(...args);
      addLog('debug', ...args);
    };

    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
      console.error = originalError;
      console.debug = originalDebug;
    };
  }, []);

  const value: LogContextType = {
    logs,
    addLog,
    clearLogs,
    getLogsAsText,
  };

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
};

export const useLogs = (): LogContextType => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
};

