import { ipcMain } from 'electron';
import { setStoreValue, getStoreValue } from '../storeManager';

export const appConfig = () => {

    ipcMain.handle('save-config', async (event, data) => {
        try {
            const { searchpreference, provider, embedprovider, trackingtool, configJson, embedconfigJson, ttconfigJson, lookupChecked } = data;
            console.log("printing test message")
            console.log(searchpreference);
            // Check and save only if the data exists
            if (provider) setStoreValue('provider', provider);
            if (embedprovider) setStoreValue('embedprovider', embedprovider);
            if (trackingtool) setStoreValue('trackingtool', trackingtool);
            if (configJson) setStoreValue('configJson', configJson);
            if (embedconfigJson) setStoreValue('embedconfigJson', embedconfigJson);
            if (ttconfigJson) setStoreValue('ttconfigJson', ttconfigJson);
            if (searchpreference) setStoreValue('searchpreference', searchpreference);
            setStoreValue('lookupChecked', lookupChecked);
    
            return { success: true, message: "Configuration saved successfully!" };
        } catch (error:any) {
            return { 
                success: false, 
                message: "Failed to save configuration.", 
                error: error.message 
            };
        }
    });

    ipcMain.handle('get-config', async (event, key) => {
        console.log(key);
        try {
            console.log(getStoreValue(key));
            return getStoreValue(key); 
        } catch (error) {
            console.error(`Error retrieving config for key:`, error);
            return null; 
        }
    });

}