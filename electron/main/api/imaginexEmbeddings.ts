import { ipcMain } from 'electron';
import axios from 'axios';
import { logger } from '../logger';
import { API_BASE_URL } from '../helper';

export const imaginexEmbeddingsHandlers = () => {
  ipcMain.handle('imaginexapi', async (_, reqmessages) => {
    console.log("Received messages in Main process:", reqmessages);
    const { language, userInput, key, valuesString  } = reqmessages;
    try {
      // stringify values by creating comma separated string from values
      
      //const valuesString = values.join(',');
     
      let formData = new FormData();
      formData.append('list', valuesString);
      formData.append('language', language);
      formData.append('userInput', userInput); 
      formData.append('key', key)

      console.log("payload to imaginex api :", formData);
      const response = await axios.post(`${API_BASE_URL}/imaginex/generate_images`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json'
        }
      });
      console.log("Response from API:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Axios Error:", error.message);
      if (error.response) {
        console.error("Error Status Code:", error.response.status);
        console.error("Error Response Body:", error.response.data);
        console.error("Error Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No Response received. Request Details:", error.request);
      }
      throw {
        message: "Failed to fetch data from OpenAI/Ollama",
        status: error.response?.status || 500,
        details: error.response?.data || error.message,
      };
    }
  });
};