import { getPromptResponses } from '@/services/imaginexService';

export function prepareFrameworkData(selectedIds: string[]): Record<string, string[]> {
    let frameworksObj: Record<string, string[]> = {};
  
    selectedIds.forEach(id => {
      let [framework, diagramType] = id.split('-');
      if (frameworksObj[framework]) {
        if (diagramType) {
          frameworksObj[framework].push(diagramType);
        }
      } else {
        frameworksObj[framework] = diagramType ? [diagramType] : [];
      }
    });
  
    return frameworksObj;
  }

  // Define types for the data structures
  interface Message {
    role: string;
    content: string;
  }
  
  interface DiagramParam {
    framework_name: string;
    use_case_desc: string;
    id: string;
    diagram_type: string;
    title?: string; // Assuming title might be optional
  }
  
  interface FormInput {
    userInputRadio: string;
    userInput: string;
  }
  
  interface DiagramResponse {
    [key: string]: [string, string]; // The key-value pair format in the response
  }
  
  // Function to interact with Electron API
  
  
  // Function to generate prompts for diagrams
  export const getDiagramPromptsResponses = (
    diagramType: string = 'wireframe',
    userInput: string = 'checkout page',
    frameworkName: string = 'plantuml salt'
  ): Promise<string | any[]> => {
    console.log('Framework Name prompts:', frameworkName);
  
    const keyLength = frameworkName.length;
    const system: Message = {
      role: "system",
      content: `Act like a software engineer who would like to prepare a diagram and wireframe using ${frameworkName} framework`
    };
  
    let user: Message;
  
    if (frameworkName.toLowerCase() === 'plantuml salt') {
      user = {
        role: "user",
        content: `Create a ${diagramType} script of ${userInput} using ${frameworkName} framework. The code must be well formed without any syntax error only code is required, no explanation needed. Code without plantuml text`
      };
    } else {
      user = {
        role: "user",
        content: `Generate "${diagramType}" diagram for the use case "${userInput}" using ${frameworkName}. The code must be well formed without any syntax error.`
      };
    }
  
    console.log('Final Prompts for Diagram generation:', user);
  
    const prompts: Message[] = [system, user];
  
    return getPromptResponses(prompts).then((response: string | any[]) => {
      if (typeof response === 'string' && response.includes('```')) {
        let splitRes = response.split('```')[1];
        if (splitRes.toLowerCase().includes(frameworkName.toLowerCase())) {
          response = splitRes.substring(keyLength);
        } else if (splitRes.toLowerCase().includes('mermaid')) {
          const mermaidKeyLength = 7;
          response = splitRes.substring(mermaidKeyLength);
        } else {
          response = splitRes;
        }
      } else if (Array.isArray(response)) {
        return response;
      } else {
        response = typeof response === 'string' ? response : [];
      }
      return response;
    });
  };
  
  // Function to generate diagrams
export const generateDiagrams = (param:any, G_formInput:any): Promise<DiagramResponse[]> => {
    console.log('generate diagrams called');
    const diagramAPIResponse: DiagramResponse[] = [];
  
    const userInputData: string = G_formInput.userInput;
  
    return Promise.all(
      param.map(async (p:any) => {
        const type = `${p.diagram_type}-${p.title || ''}`;
        const frameworkName = p.framework_name;
        const newPrompts = await getDiagramPromptsResponses(p.diagram_type, userInputData, frameworkName);
        diagramAPIResponse.push({ [type]: [newPrompts as string, frameworkName] });
      })
    ).then(() => {
      console.log("Diagram API response:", diagramAPIResponse);
      return diagramAPIResponse;
    });
  };