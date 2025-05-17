const { contextBridge, ipcRenderer } = require('electron')

// Suppress autofill-related errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message.includes('Autofill') || event.message.includes('HTTP/1.1')) {
      event.preventDefault()
    }
  })
}

const api = {
  closeWindow: () => ipcRenderer.send('close-window'),
  reloadWebview: () => ipcRenderer.send('reload-webview')
}

contextBridge.exposeInMainWorld('electronAPI', api)