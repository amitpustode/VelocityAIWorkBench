interface Window {
    electronAPI: {
        runPython(): unknown;
        logEvent(level: any, message:any): unknown;
        setLogLevel(level: any): Promise<Any>;
        openVSCode: () => void;
        fetchLogs: (date:any) => Promise<string>;
        sendChatMessage: (msg: string) =>  Promise<Any>;
        loadSettings: () => Promise<Record<string, string>>;
        saveSettings: (settings: Record<string, string>) => void;
        watchLogs: () => void;
        destroyWatcher: () => void;
        onLogUpdated: (callback: (logs: string) => void) => void;
        getModelDirectory: () => Promise<string>;
        getInstalledModels: () => Promise<string[]>;
        getOllamaUrl: () => Promise<string>;
        deleteModel: (modelName: string) => void;
        selectFolder: () => Promise<string>;
        uploadFiles: (files: { name: string; path: string }[]) => Promise<boolean>;
        trainKnowledgeBase: () => Promise<boolean>;
        getBasePath: () => Promise<string>;
        getPromptResponses: (messages: any[]) => Promise<{ diagrams: Diagram[] }>;
        getBravoPromptResponses: (messages: any[]) => Promise<any>;
        getBravoEmbeddingsResponses: (messages: any) => Promise<any>;
        getBravoEmbeddingsStories: (messages: any) => Promise<any>;
        pushEpicToJira: (epicdata: any) => Promise<any>;
        pushStoryToJira: (storydata: any) => Promise<any>;
        submitFiles: (uploadfiles: any) =>  Promise<any>;
        pdftotext: (uploadedfile:any) => Promise<any>;
        saveConfig: (data: any) => Promise<any>;
        getConfig: (key: any) => Promise<any>;
        openExternal(url: any): unknown; 
        shareConfig: (data: any) => Promise<any>;
        getPublicKey: () => Promise<{ publicKey: string }>;
        getSearchTicketResponses: (data: any) => Promise<any>;
        uploadBugHunterCSV: (data: any) => Promise<any>;
        getServerHealth:() => Promise<any>;
    };
  }

  declare module 'dom-to-image-more';
  declare module 'pdf-parse/lib/pdf-parse';