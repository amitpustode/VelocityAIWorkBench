// src/api.ts
import { FormData, Diagram, Message } from '../types/types';

export async function getPromptsResponses(
    form: FormData,
    key: string,
    values: string[]
  ): Promise<{ diagrams: Diagram[] }> {
    const { userInput, language } = form;
  
    // Creating the user prompt
    const userPrompt: Message = {
      role: "user",
      content: `Create a list of ${values.join(", ")} diagrams to be generated for the requirement "${userInput}" in a tabular format as unique id | Title | Diagram Type | Diagram As Code Framework | Use Case Desc. Title should be a short description of the Use Case Desc under 15 words in ${language}. Diagram As Code Framework should be ${key}. Format: JSON`,
    };
  
    // Creating the system prompt
    const systemPrompt: Message = {
      role: "system",
      content: `Act like a software engineer who would like to prepare a Table using JSON data format. Please share the output in valid JSON Format without comments. Example JSON => { "diagrams": [ { "id": "Unique id", "title": "Title", "diagram_type": "Diagram Type", "use_case_desc": "Use Case Desc", "framework_name": "Diagram As Code Framework" } ] }`,
    };
  
    try {
      // Making the API request to get diagrams
      const response = await getPromptResponses([systemPrompt, userPrompt]);
  
      // Ensuring proper structure of the response
      if (response) {
        return response;
      }
  
      // Fallback: Empty array if response does not meet expectations
      return {
        diagrams: [],
      };
    } catch (error:any) {
      console.error("Error fetching diagram data:", error.details);
      throw error;
    }
  }
  
  export async function getPromptResponses(messages: Message[]):Promise<any> {
    try {
      console.log("Sending messages to Electron:", messages);
  
      // Invoke Electron API
      const response:any = await window.electronAPI.getPromptResponses(messages);
  
      console.log("Response received from Electron:", response);
  
      // Validate and return the response
      if (response) {
        let diagrams: Diagram[] = response.choices[0].message.content;
        console.log(diagrams);
        return diagrams;
      }
  
      throw new Error("Invalid response format received from Electron API.");
    } catch (error: any) {
      console.error("Error calling Electron function:", error);
      throw error;
    }
  }
  
