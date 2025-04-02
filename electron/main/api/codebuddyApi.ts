import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { logger } from '../logger';

export const codebuddyIpcHandlers = () => {
    
    ipcMain.on('open-vscode', () => {
    try {
        const vscodePath = process.platform === 'win32' ? 'code' : '/usr/local/bin/code'; // Adjust this path if necessary
        exec(`${vscodePath}`, (error:any) => {
            if (error) {
                logger.error(`Error launching Visual Studio Code: ${error.message}`);
                return;
            }
            logger.info('Visual Studio Code launched successfully');
        });
    } catch (error:any) {
        logger.error(`Error in open-vscode handler: ${error.message}`);
    }
    });
    
}