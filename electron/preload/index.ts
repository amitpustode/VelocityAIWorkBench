import { ipcRenderer, contextBridge, shell } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  logEvent: (level: string, message: any) => ipcRenderer.send('log-event', level, message),
  setLogLevel: (level: string) => ipcRenderer.send('set-log-level', level),
  sendChatMessage: async (message:any) =>
      ipcRenderer.invoke('send-chat-message', message),
  openVSCode: () => ipcRenderer.send('open-vscode'),
  fetchLogs: (date:any) => ipcRenderer.invoke('fetch-logs', date),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings:any) =>
      ipcRenderer.send('save-settings', settings),
  watchLogs: () => ipcRenderer.send('watch-logs'),
  destroyWatcher: () => ipcRenderer.send('destroy-watcher'),
  onLogUpdated: (callback:any) =>
      ipcRenderer.on('log-updated', (_, logs) => callback(logs)),
  getBasePath: () => ipcRenderer.invoke('get-base-path'),
  getPromptResponses: (messages: any) => ipcRenderer.invoke('fetch-prompt-responses', { messages }),
  getBravoPromptResponses: (messages: any) => ipcRenderer.invoke('fetch-bravoprompt-responses', { messages }),
  pushEpicToJira: (epicdata: any) => ipcRenderer.invoke('push-epicsTo-jira', { epicdata }),
  pushStoryToJira: (storydata: any) => ipcRenderer.invoke('push-storyWithEpic', { storydata }),
  saveConfig: (data:any) => ipcRenderer.invoke('save-config', data),
  shareConfig: (data:any) => ipcRenderer.invoke('save-setting-configs', data),
  getConfig: (key:any) => ipcRenderer.invoke('get-config', key),
  submitFiles: (uploadedfiles:any) => ipcRenderer.invoke('submit-files', uploadedfiles),
  pdftotext: (uploadedfile:any) => ipcRenderer.invoke('pdf-to-text', uploadedfile),
  openExternal: (url:any) => shell.openExternal(url),
  getBravoEmbeddingsResponses: (messages: any) => ipcRenderer.invoke('fetch-bravo-embeddings-responses', {messages}),
  getBravoEmbeddingsStories: (messages: any) => ipcRenderer.invoke('fetch-bravo-stories', {messages}),
  getPublicKey: () => ipcRenderer.invoke('get-public-key'),
  getSearchTicketResponses: (data: any) => ipcRenderer.invoke('bug_hunter', data),
  uploadBugHunterCSV: (data: any) => ipcRenderer.invoke('bug_hunter_upload_csv', data),
  getServerHealth:() => ipcRenderer.invoke('health-check')
});

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: url('./gl-logo.png');
  background-size: contain;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)