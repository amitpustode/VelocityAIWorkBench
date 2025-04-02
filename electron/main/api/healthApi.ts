
import { ipcMain } from 'electron'
import axios from 'axios';
import { API_BASE_URL} from '../helper';
import { logger } from '../logger';

export const healthHandler = () => {
    ipcMain.handle('health-check', async (_, form:any) => {
        try {
            let url = `${API_BASE_URL}/settings/health`;
            const response = await axios.get(url);
            let data = response.data;
            return data;
        } catch (error: any) {
            console.error("Error in Electron IPC:", error?.message || error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Body:", error.response.data);
            }
            throw new Error("Failed to fetch data in Electron: " + error.message);
        }
    });

    
}
