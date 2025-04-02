// src/types.ts

export interface Diagram {
    diagrams: Diagram;
    id: string;
    title: string;
    diagram_type: string;
    framework_name: string;
    use_case_desc: string;
  }
  
  export interface States {
    totalUsersCount: number;
    uniqueUserCount: number;
    totalDiagramsGenerated: number;
    requestServed: number;
  }
  
  export interface FormData {
    radioOption: string;
    userInput: string;
    selectedIds: string[];
    language: string;
    codeFile: any;
    reqFile: any;
  }
  
  export interface Response {
    userInput: string;
    diagrams: Diagram[];
  }

  export interface Message {
    role: string;
    content: string;
  };

  export interface DiagramParam {
    framework_name: string;
    use_case_desc: string;
    id: string;
    diagram_type: string;
    title?: string; // Assuming title might be optional
  }

  export interface FormInput {
    userInputRadio: string;
    userInput: string;
  }
  