import axios from 'axios';
import { ipcMain } from 'electron';
import { API_BASE_URL, loadConfig } from '../helper'; // Import the API_BASE_URL and loadConfig function
import FormData from 'form-data';

console.log('API_BASE_URL Default:', API_BASE_URL);
loadConfig(); // Call the function to load config and update the API_BASE_URL
console.log('API_BASE_URL Config:', API_BASE_URL);

export const bugHunterIpcHandlers = () => {

    ipcMain.handle('bug_hunter', async (_, data) => {

        console.log("data111", data);
        try {

            const response = await axios.get(`${API_BASE_URL}/bug_hunter/search`, {
                params: { query: data }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error reading bug_hunter:', error);
            throw error;
        }
    });

    ipcMain.handle("bug_hunter_upload_csv", async (_, fileData) => {
       
        try {
          const formData = new FormData();
          
          formData.append("files", Buffer.from(fileData.data), {
            filename: fileData.name,
            contentType: "text/csv", 
          });
      
          // Send the file to the API
          const response = await axios.post(`${API_BASE_URL}/bug_hunter/upload`, formData, {
            headers: {
              ...formData.getHeaders(),
            },
          });
      
          return response.data;
        } catch (error) {
          console.error("Error uploading file:", error);
          throw error;
        }
      });
};