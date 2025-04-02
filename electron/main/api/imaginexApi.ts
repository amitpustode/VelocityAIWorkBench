import { ipcMain } from 'electron';
import axios from 'axios';
import { 
    OPENAI_URL, 
    IMAGINEX_OPENAI_KEY, 
    Default_Provider,
    OPENAI_MODEL 
} from '../openAIConfig';
import {
    extractJsonFromOllamaResponse,
    removeNonJsonText
} from '../helper';
import { logger } from '../logger';

export const imaginexIpcHandlers = () => {

    ipcMain.handle('fetch-prompt-responses', async (_, reqmessages) => {
        const { messages } = reqmessages;
        try {
            console.log("Received messages in Main process:", messages);
            console.log("IMAGINEX_OPENAI_URL:", OPENAI_URL);
            console.log("IMAGINEX_OPENAI_KEY:", IMAGINEX_OPENAI_KEY);
            console.log("OPENAI_MODEL:", OPENAI_MODEL);
    
            // Normalize `messages` to always be an array of message objects
            const normalizedMessages = Array.isArray(messages) ? messages : [{ role: 'user', content: messages }];
            console.log("Normalized messages:", normalizedMessages);
    
            let headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            let requestBody = {};
            let provider = Default_Provider.toLowerCase();
            let url = OPENAI_URL;
            let apiKey = IMAGINEX_OPENAI_KEY;
    
            if (provider === 'azureopenai') {
                headers['api-key'] = apiKey;
                requestBody = {
                    messages: normalizedMessages,
                    max_tokens: 10000,
                    temperature: 0,
                };
            } else if (provider === 'openai') {
                headers['Authorization'] = `Bearer ${apiKey}`;
                requestBody = {
                    model: OPENAI_MODEL,
                    messages: normalizedMessages,
                    max_tokens: 10000,
                    temperature: 0,
                };
            } else if (provider === 'ollama') {
                console.log('inside ollama');
                url = OPENAI_URL+'/api/generate';
                // Ollama requires a single string prompt instead of `messages`
                requestBody = {
                    model: OPENAI_MODEL,
                    prompt: normalizedMessages.map((msg: any) => msg.content).join('\n'),
                    stream: false,
                };
                // No API key required for Ollama
            }
    
            console.log("Request Body:", requestBody);
    
            // Send request to the selected provider
            const response = await axios.post(url, requestBody, 
            { 
                headers
            });
            console.log(response);
            let data = response.data;
    
            // 🔹 Handle Ollama-specific response normalization
            if (provider === 'ollama') {
                let responseText = data.response || "";  // Ensure it's a string
                let extractedJson = extractJsonFromOllamaResponse(responseText);
    
                // Wrap Ollama response in OpenAI-compatible structure
                data = {
                    choices: [
                        {
                            message: {
                                content: extractedJson,
                                role: "assistant"
                            }
                        }
                    ]
                };
            }
    
            console.log("Final Response Data:", JSON.stringify(data));
            return data;
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

}