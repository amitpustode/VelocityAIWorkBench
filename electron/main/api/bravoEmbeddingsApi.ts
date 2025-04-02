import { ipcMain } from 'electron'
import axios from 'axios';
import { 
        OPENAI_URL, 
        IMAGINEX_OPENAI_KEY, 
        Default_Provider,
        OPENAI_MODEL,
        JIRAENDPOINT,
        JIRATOKEN,
        JIRAEMAIL,
        JIRAPROJECTKEY
    } from '../openAIConfig';

import { logger } from '../logger';
import { API_BASE_URL, API_BASE_URL_PORT, loadConfig } from '../helper';
import { lang } from 'moment';

export class Epic {
    Epic_Id: string;
    Epic_title: string;
    Epic_Description: string;
    Epic_type: string;
  
    constructor(Epic_Id: string, Epic_title: string, Epic_Description: string, Epic_type: string) {
      this.Epic_Id = Epic_Id;
      this.Epic_title = Epic_title;
      this.Epic_Description = Epic_Description;
      this.Epic_type = Epic_type;
    }
  }

export const bravoEmbeddingsIpcHandlers = () => {

    

    ipcMain.handle('fetch-bravo-stories', async (_, reqmessages) => {
        console.log("Received messages in fetch-bravo-stories:", reqmessages);
        const {story_type, language, epic} = reqmessages
        

        const params = {
            story_type: encodeURIComponent('functional story'), 
            language: reqmessages.messages.language
        };
        
        
        const requestBody = {
            considerEmbedding : reqmessages.messages.considerEmbedding,
            story_type: encodeURIComponent(reqmessages.messages.story_type),  
            language: reqmessages.messages.language,                 
            epic: {
                epic_id: reqmessages.messages.epic.epic_id,
                epic_title: reqmessages.messages.epic.epic_title,
                epic_description: reqmessages.messages.epic.epic_description,
                epic_type: reqmessages.messages.epic.epic_type
            }
        };
        
        console.log('requestBody', requestBody)
        const response = await axios.post(`${API_BASE_URL}/bravo/generate_stories`, requestBody,{
            params: params,
          
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });
        //console.log("Response from API:", response.data);
        return response.data;

    });


    ipcMain.handle('fetch-bravo-embeddings-responses', async (_, reqmessages) => {
        console.log("Received messages in Main process:", reqmessages);
        const { userInput, language, epic_type, reqFile  } = reqmessages;
        try {
            let formData = new FormData();
            formData.append('epic_type', reqmessages.messages.epic_type);
            formData.append('language', reqmessages.messages.language);
            formData.append('userInput', reqmessages.messages.userInput);
            formData.append('considerEmbedding', reqmessages.messages.considerEmbedding);
            
            const response = await axios.post(`${API_BASE_URL}/bravo/generate_requirements`,  formData,{
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'accept': 'application/json'
                    }
                });
                console.log("Response from API:", response.data);
                return response.data;
           
            
        } catch (error: any) {
            console.error("Error in Electron IPC:", error?.message || error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Body:", error.response.data);
            }
            console.error("Stack:", error.stack);
            console.error("Error in Electron IPC:", error?.message || error);
            throw new Error("Failed to fetch data in Electron: " + error.message);
        }
    });

    ipcMain.handle('push-epicsTo-jira', async (_, payload) => {
        try {
            const { epicdata } = payload;
            if (!epicdata) throw new Error("Epic data is missing.");
    
            let apiUrl = `${JIRAENDPOINT}`;
            
            console.log('jira url', apiUrl);
    
            // Create axios instance with httpsAgent
            const instance = axios.create({
                baseURL: apiUrl
            });
    
            const auth = 
                'Basic ' + Buffer.from(`${JIRAEMAIL}:${JIRATOKEN}`).toString('base64');
    
            const response = await instance.post('/', epicdata.epicdata, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: auth,
                },
            });
    
            return response.data; 
        } catch (error:any) {
            console.error("Error pushing epic to Jira:", error);
        
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 'Unknown';
                const details = error.response?.data || 'No details available';
                throw {
                    status: 'error',
                    message: `Jira API Error (${status}): ${details}`,
                    stack: error.stack || '',
                };
            }
        
            throw {
                status: 'error',
                message: 'Unexpected Error: ' + error.message,
                stack: error.stack || '',
            };
        }
    });
    

    ipcMain.handle('push-storyWithEpic', async (_, payload) => {
        const jiradata = payload.storydata;
        try {
            const { storyData, projectKey } = jiradata;
    
            // Validate essential inputs
            if (!storyData) throw new Error('Story data is missing.');
            if (!storyData.epic_id) throw new Error('Epic ID is missing.');
            if (!projectKey) throw new Error('Project Key is missing.');
    
            const auth = 
                'Basic ' + Buffer.from(`${JIRAEMAIL}:${JIRATOKEN}`).toString('base64');
    
            const apiUrl = `${JIRAENDPOINT}`;
    
            // Build Story Payload
            const storyPayload = {
                "fields": {
                    "project": { "key": projectKey },
                    "summary": storyData.story_title,
                    "description": storyData.story_desc,
                    "issuetype": { "name": "Story" },
                    "customfield_10011": storyData.jira_issue_id, // Replace with actual Epic Link field key
                    "labels": [storyData.epic_title, storyData.story_title],
                    "priority": { "name": "High" }
                }
            };

            console.log(storyPayload);
    
            const response = await axios.post(apiUrl, storyPayload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: auth,
                },
            });
    
            return response.data;
        } catch (error:any) {
            console.error("Error occurred in handler for 'push-storyWithEpic':", error);
    
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 'Unknown';
                const details = error.response?.data || 'No details available';
                throw {
                    status: 'error',
                    message: `Jira API Error (${status}): ${details}`,
                    stack: error.stack || '',
                };
            }
    
            throw {
                status: 'error',
                message: 'Unexpected Error: ' + error.message,
                stack: error.stack || '',
            };
        }    
    });

    
}
