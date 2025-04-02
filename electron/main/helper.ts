import * as fs from 'fs';
import * as path from 'path';

// Default value
let API_BASE_URL = 'http://127.0.0.1:5001/api';
let API_BASE_URL_PORT = 5001;

//This code is not working as of now but settings are at one place.
// Export the loadConfig function to be used in other files
export const loadConfig = () => {
    try {
        // Use import.meta.url to get the current file's directory in ES modules
        const __dirname = path.dirname(new URL(import.meta.url).pathname); 
        const configPath = path.join(__dirname, '.', 'config.json'); // Go one folder up to find config.json
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configData);
        if (config.apiBaseURL) {
            API_BASE_URL = config.apiBaseURL; // Assign the value from config
            API_BASE_URL_PORT = config.apiBaseURLPort; // Assign the value from config
        }
    } catch (error) {
        console.error('Error loading config:', error);
        // If an error occurs (e.g., file not found or invalid JSON), the default API_BASE_URL is used
    }
};

// Immediately load the configuration
loadConfig();

console.log('API_BASE_URL:', API_BASE_URL);

/**
     * Extracts only the valid JSON content from Ollama's response.
     * - If JSON is wrapped in triple backticks, extract and parse it.
     * - If JSON is mixed with additional text, extract and clean it.
     * - If no JSON is found, return the raw response.
     */
export function extractJsonFromOllamaResponse(responseText: string): string {
    const tripleBacktickRegex = /```([\s\S]*?)```/;
    let extractedContent = responseText;

    // Try extracting content within triple backticks
    const match = responseText.match(tripleBacktickRegex);
    if (match) {
        extractedContent = match[1].trim();
    }

    // Attempt to clean and parse JSON
    let parsedJson;
    try {
        parsedJson = JSON.parse(extractedContent);
        return JSON.stringify(parsedJson, null, 2); // Pretty print JSON
    } catch (error) {
        console.warn("Failed to parse JSON from Ollama response, returning raw response.");
    }

    // If JSON parsing fails, remove non-JSON parts manually
    return removeNonJsonText(responseText);
}

/**
 * Removes non-JSON text from a given response.
 * This ensures that only valid JSON is extracted, even if it's not inside triple backticks.
 */
export function removeNonJsonText(responseText: string): string {
    const jsonRegex = /{[\s\S]*}/; // Matches first valid JSON block
    const match = responseText.match(jsonRegex);

    if (match) {
        return match[0]; // Return only the extracted JSON block
    }
    return responseText; // Fallback: return full response if no JSON is found
}

// Export the current API_BASE_URL to be used in other files
export { API_BASE_URL, API_BASE_URL_PORT };