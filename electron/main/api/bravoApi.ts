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
import {
        extractJsonFromOllamaResponse,
        removeNonJsonText
    } from '../helper';
import https from 'https';
import { logger } from '../logger';

export const bravoIpcHandlers = () => {

    ipcMain.handle('fetch-bravoprompt-responses', async (_, form:any) => {
        const { messages } = form;
        try {
            console.log("Received messages in Main process:", messages);
            
            // Validate and normalize `messages`
            const normalizedMessages = Array.isArray(messages) ? messages : [messages];
            
            let provider = Default_Provider;
            let url = OPENAI_URL;
            let apiKey = IMAGINEX_OPENAI_KEY;
            
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            let requestBody: any = {};
    
            if (provider.toLowerCase() === 'azureopenai') {
                headers['api-key'] = apiKey;
                requestBody = {
                    messages: normalizedMessages,
                    max_tokens: 10000,
                    temperature: 0
                };
            } else if (provider.toLowerCase() === 'openai') {
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = {
                    model: OPENAI_MODEL,
                    messages: normalizedMessages,
                    max_tokens: 10000,
                    temperature: 0
                };
            } else if (provider.toLowerCase() === 'ollama') {
                requestBody = {
                    model: OPENAI_MODEL,
                    prompt: normalizedMessages.map((m: any) => m.content).join('\n\n'),
                    stream: false
                };
            }
    
            console.log("Sending to URL:", url);
            console.log("Request Body:", requestBody);
    
            // Fire the request
            const response = await axios.post(url, requestBody, { headers });
            let data = response.data;
    
            // 🔹 Handle Ollama-specific response normalization
            if (provider.toLowerCase() === 'ollama') {
                let responseText = data.response || ""; // Default to empty string if undefined
                let extractedJson = extractJsonFromOllamaResponse(responseText);
    
                data = {
                    choices: [
                        {
                            message: {
                                role: "assistant",
                                content: extractedJson // This is now guaranteed to be clean JSON
                            }
                        }
                    ]
                };
            }
    
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

    ipcMain.handle('push-epicsTo-jira', async (_, payload) => {
        try {
            const { epicdata } = payload;
            console.log(JSON.stringify(payload));
            if (!epicdata) throw new Error("Epic data is missing.");
    
            let apiUrl = `${JIRAENDPOINT}`;
            
            console.log('jira url:', apiUrl);

            if (epicdata.epicdata?.fields?.project) {
                epicdata.epicdata.fields.project.key = JIRAPROJECTKEY;
            }
    
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
    