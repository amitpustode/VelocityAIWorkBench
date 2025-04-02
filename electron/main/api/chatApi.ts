import { ipcMain } from 'electron'
import * as fs from 'fs';
import axios from 'axios';
import { logger } from '../logger';
import { 
    OPENAI_URL, 
    IMAGINEX_OPENAI_KEY,
    Default_Provider,
    OPENAI_MODEL,
    SEARCH_PREFERENCE
} from '../openAIConfig';
import { settingsFilePath } from '../electronConfig';
import { API_BASE_URL, loadConfig } from '../helper'; // Import the API_BASE_URL and loadConfig function

console.log('API_BASE_URL Default:', API_BASE_URL);
loadConfig(); // Call the function to load config and update the API_BASE_URL
console.log('API_BASE_URL Config:', API_BASE_URL);


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

export const chatIpcHandlers = () => {

    ipcMain.handle('send-chat-message', async (_, message) => {
        console.log(SEARCH_PREFERENCE);
        const {input} = message
    try {
        // psot embedding:
        //     LLM
        //     embedding model
        //     vector db
        //     croma db
        //     AIProvider Embedding
        console.log("Received messages in fetch-bravo-stories:", message);
        console.log("Received message in Main process:", input);
        const query = encodeURIComponent(message);
        console.log("Query:", query);
        let response;

        if(SEARCH_PREFERENCE == 'embedded'){
            const response = await axios.get(`${API_BASE_URL}/search?query=${query}`);
            console.log("response received", response.data);
            return response.data;
        }
        else
        {
            response = await axios.get(`${API_BASE_URL}/openchat?query=${query}`);
            console.log("Response from API:", response.data);
            return response.data;
        }
      
      
    } catch (error:any) {
        if (error.response) {
            console.error('Error Response: ', error.response.data);
            console.error('Error Status: ', error.response.status);
        } else {
            console.error('Error Message: ', error.message);
        }
        return `Error: ${error.message}`; // Return error as the response
    }
    });

}