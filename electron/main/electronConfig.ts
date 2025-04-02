import { app } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const fallbackPath = path.join(__dirname, 'logs'); // Fallback for logs in the current directory
export const logsDir = path.join(app.getPath('userData') || fallbackPath, 'logs'); // Use Electron's userData path or fallback
export const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

const require = createRequire(import.meta.url)