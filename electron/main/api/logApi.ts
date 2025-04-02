import { ipcMain } from 'electron';
import * as fs from 'fs';
import path from 'node:path';
import { logsDir } from '../electronConfig';
import { logger, updateLogLevel } from '../logger';
import winston from 'winston';

const logWatchers = new Map(); // Store watchers for each renderer process


function ensureDirectoryExists(dirPath: any) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true }); // Create the directory and any necessary parent directories
      logger.info(`Directory created at: ${dirPath}`);
    } catch (err:any) {
      console.error(`Failed to create directory at ${dirPath}: ${err.message}`);
    }
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
}

// Ensure the logs directory exists
ensureDirectoryExists(logsDir);

function getLogFileByDate(date = null) {
  const files = fs.readdirSync(logsDir);

  // Filter log files
  const logFiles = files.filter(file => file.startsWith('application-') && file.endsWith('.log'));

  if (logFiles.length === 0) {
    return null;
  }

  if (date) {
    // Format date to match the filename pattern
    const formattedDate = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
    const targetFile = `application-${formattedDate}.log`;

    // Check if the specific file exists
    if (logFiles.includes(targetFile)) {
      return path.join(logsDir, targetFile);
    }
    return null;
  }

  // If no date provided, return the most recent log file
  logFiles.sort((a, b) => b.localeCompare(a));
  return path.join(logsDir, logFiles[0]);
}

// Function to get the most recent log file
function getMostRecentLogFile() {
  const files = fs.readdirSync(logsDir);

  // Filter to only log files (assuming they follow the 'application-YYYY-MM-DD.log' pattern)
  const logFiles = files.filter(file => file.startsWith('application-') && file.endsWith('.log'));

  if (logFiles.length === 0) {
    return null;
  }

  // Sort the log files by date (newest first)
  logFiles.sort((a, b) => b.localeCompare(a));

  return path.join(logsDir, logFiles[0]);
}

// Function to fetch logs from the most recent log file
// Fetch logs based on the date
function fetchLogs(date = null) {
  console.log('logs date',date);
  const logFilePath = getLogFileByDate(date);

  console.log(logFilePath);

  if (!logFilePath) {
    return { error: `No log file found${date ? ` for date: ${date}` : ''}` };
  }

  try {
    const logData = fs.readFileSync(logFilePath, 'utf-8');
    return { data: logData };
  } catch (err:any) {
    return { error: `Error reading log file: ${err.message}` };
  }
}

export const logIpcHandlers = () => {

    ipcMain.on('watch-logs', (event) => {
    const senderId = event.sender.id;
    const logFilePath = getMostRecentLogFile(); // Get the most recent log file

    if (!logFilePath) {
        event.sender.send('log-updated', { error: 'No log file found to watch.' });
        return;
    }

    // Check if a watcher already exists for this sender ID
    if (logWatchers.has(senderId)) {
        logger.warn(`Log watcher already exists for sender ID: ${senderId}`);
        return;
    }

    try {
        // Create a watcher for the log file
        const watcher = fs.watch(logFilePath, (eventType) => {
        if (eventType === 'change') {
            try {
            const logs = fs.readFileSync(logFilePath, 'utf-8');
            event.sender.send('log-updated', logs);
            } catch (error:any) {
            logger.error(`Error reading updated log file: ${error.message}`);
            }
        }
        });

        // Store the watcher in the map
        logWatchers.set(senderId, watcher);

        // Clean up watcher when 'destroy-watcher' is triggered
        ipcMain.once('destroy-watcher', () => {
        const activeWatcher = logWatchers.get(senderId);
        if (activeWatcher) {
            activeWatcher.close();
            logWatchers.delete(senderId);
            logger.info(`Log watcher destroyed for sender ID: ${senderId}`);
        }
        });

    } catch (error:any) {
        logger.error(`Error setting up log watcher: ${error.message}`);
    }
    });


    ipcMain.handle('fetch-logs', (_, date:any) => {
      ensureDirectoryExists(logsDir);
      console.log('logsdir',date);
      return fetchLogs(date);
    });

    ipcMain.on('log-event', (event, level: string, message: string) => {
      try {
        if (Object.keys(winston.config.npm.levels).includes(level)) {
          logger.log(level as string, message); // Ensure level is passed as a string
        } else {
          logger.warn(`Invalid log level: ${level}, message: ${message}`);
        }
      } catch (error: any) {
        logger.error(`Error in log-event handler: ${error.message}`);
      }
    });

    ipcMain.on('set-log-level', (event, newLevel) => {
      console.log(newLevel);
      updateLogLevel(newLevel);
    });

}