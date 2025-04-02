/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}

declare module 'pdfjs-dist' {
  var pdfjsLib: any;
  export = pdfjsLib;
}