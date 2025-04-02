import { app, BrowserWindow, shell, ipcMain, screen, Menu, dialog, nativeImage, nativeTheme } from 'electron'
import os from 'node:os'
import * as fs from 'fs';
import 'winston-daily-rotate-file';
import path from 'node:path'
import { exec } from 'child_process';
import { update } from './update';
import { logger } from './logger'
import { __dirname } from './electronConfig';
import { chatIpcHandlers } from './api/chatApi';
import { logIpcHandlers } from './api/logApi';
import { codebuddyIpcHandlers } from './api/codebuddyApi';
import { imaginexIpcHandlers } from './api/imaginexApi';
import { createPythonServerContainer, knowledgeBaseIpcHandlers } from './api/knowledgeApi';
import { bravoIpcHandlers } from './api/bravoApi';
import { appConfig } from './api/configApi';
import { settingsIpcHandlers } from './api/settingsApi';
import { pdftotexthandlers } from './api/pdftotxt';
import { bravoEmbeddingsIpcHandlers } from './api/bravoEmbeddingsApi';
import { bugHunterIpcHandlers } from './api/bugHunterApi';

import {healthHandler} from "./api/healthApi";
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Ignore certificates and allow localhost
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// Define paths
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
const configPath = path.join(app.getPath('userData'), 'config.json');

// Handle logger errors
logger.on('error', (err) => {
  console.error('Logger encountered an error:', err);
});

logger.info('Logger initialized successfully.');

async function createWindow() {
  const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.png'); // For Windows/Linux
  const macIconPath = path.join(process.env.VITE_PUBLIC, 'icon.icns'); // For macOS
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: width,
    height: height,
    title: 'VelocityAI Workbench',
    icon: process.platform === 'darwin' ? macIconPath : iconPath,
    webPreferences: {
      preload,
      contextIsolation: true,
      webviewTag: true,
      nodeIntegration: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
    logger.info('Main window loaded: ' + indexHtml);
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  });

  // Intercept new-window or target="_blank" links
  win.webContents.setWindowOpenHandler(({ url }) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const childWindow = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        contextIsolation: true,
      },
    });

    childWindow.loadURL(url); // Load the URL in the new window
    return { action: 'deny' }; // Prevent the default new-window behavior
  });

   // Only set the menu for non-Windows platforms to enable edit functionality
  if (process.platform !== 'win32') {
    // Set a simple menu
    const menuTemplate:any = [{
      label: "Application",
      submenu: [
          {
            label: "About",
            click: () => {
              const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.png'); // For Windows/Linux
              const icon = nativeImage.createFromPath(iconPath);
              
              dialog.showMessageBox({
                type: "info",
                title: "About",
                message: `VelocityAI Workbench\n Version ${app.getVersion()} (MVP Release)`,
                icon: icon,
                buttons: ["OK"]
              });
            }
          },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
    ];
    
    const customMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(customMenu);
  } else {
    const menuTemplate:any = [{
      label: "About",
      submenu: [
        {
          label: "About",
          click: () => {
            const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.png'); // For Windows/Linux
            const icon = nativeImage.createFromPath(iconPath);
            
            dialog.showMessageBox({
              type: "info",
              title: "About",
              message: `VelocityAI Workbench\nVersion ${app.getVersion()} (MVP Release)`,
              icon: icon,
              buttons: ["OK"]
            });
          }
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    }];
    
    const customMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(customMenu);
  }
  
  update(win);
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light'; // Force light mode
  createWindow();
  createPythonServerContainer();
  chatIpcHandlers();
  logIpcHandlers();
  bugHunterIpcHandlers();
  codebuddyIpcHandlers();
  imaginexIpcHandlers();
  knowledgeBaseIpcHandlers();
  bravoIpcHandlers();
  appConfig();
  settingsIpcHandlers();
  pdftotexthandlers();
  healthHandler();
  bravoEmbeddingsIpcHandlers();
});

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Load settings from file
const loadSettings = () => {
  try {
      if (fs.existsSync(settingsFilePath)) {
          const data = fs.readFileSync(settingsFilePath, 'utf-8');
          return JSON.parse(data);
      }
      logger.warn('Settings file not found. Using default settings.');
  } catch (error:any) {
      logger.error(`Error loading settings: ${error.message}`);
  }
  return { provider: '', apiUrl: '', modelName: '', apiKey: '' }; // Default settings
};

// Save settings to file
const saveSettings = (settings:any) => {
  try {
      fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
      logger.info('Settings saved successfully.');
  } catch (error:any) {
      logger.error(`Error saving settings: ${error.message}`);
  }
};

// IPC handlers
ipcMain.handle('load-settings', async () => {
  try {
      return loadSettings();
  } catch (error:any) {
      logger.error(`Error in load-settings handler: ${error.message}`);
      return { provider: '', apiUrl: '', modelName: '', apiKey: '' }; // Default response
  }
});

ipcMain.on('save-settings', (event, settings) => {
  try {
      saveSettings(settings);
  } catch (error:any) {
      logger.error(`Error in save-settings handler: ${error.message}`);
  }
});

ipcMain.handle('get-base-path', async () => {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icons') // For production
    : path.join('src/assets/icons'); // For development
});