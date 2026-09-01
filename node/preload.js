const { contextBridge, webUtils, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('process', process)

contextBridge.exposeInMainWorld('myAPI', {

  getPathForFile: (file) => webUtils.getPathForFile(file)

});

contextBridge.exposeInMainWorld('myElectron', {

  sendToMain: (channel, ...data) => ipcRenderer.send(channel, ...data),

  receiveFromMain: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),

  setZoomFactor: (zoomFactor) => { webFrame.setZoomFactor(zoomFactor) },

  clearCache: () => { webFrame.clearCache() }

});
