import axios from 'axios';
import { ipcMain } from 'electron';
import { API_BASE_URL, loadConfig } from '../helper'; // Import the API_BASE_URL and loadConfig function

console.log('API_BASE_URL Default:', API_BASE_URL);
loadConfig(); // Call the function to load config and update the API_BASE_URL
console.log('API_BASE_URL Config:', API_BASE_URL);

export const settingsIpcHandlers = () => {
    console.log("settingsIpcHandlers calling API", API_BASE_URL);

    ipcMain.handle('save-setting-configs', async (event, encryptedData) => {
        try {
            console.log(" data at Electron layer:", encryptedData);
           /* console.log("Encrypted data at Electron layer:", {   // just to verify will remove later
                encryptedKeyLength: encryptedData.encryptedKey.length,
                encryptedDataLength: encryptedData.encryptedData.length,
                ivLength: encryptedData.iv.length,
                sample: {
                    encryptedKey: `${encryptedData.encryptedKey.slice(0, 20)}...`,
                    encryptedData: `${encryptedData.encryptedData.slice(0, 20)}...`,
                    iv: `${encryptedData.iv.slice(0, 20)}...`
                }
            });*/
            
            const response = await axios.post(
                `${API_BASE_URL}/settings/save-config`, 
                encryptedData
            );
            return response.data;
        } catch (error: any) {
            console.error('Error saving encrypted config:', error.response?.data || error.message); 
            throw new Error(error.response?.data?.detail || error.message);
        }
    });

    ipcMain.handle('read-config', async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/read-config`);
            return response.data;
        } catch (error: any) {
            console.error('Error reading config:', error);
            throw error;
        }
    });

    ipcMain.handle('get-public-key', async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings/public-key`);
            return response.data;
        } catch (error) {
            console.error('Error fetching public key:', error);
            throw error;
        }
    });
};