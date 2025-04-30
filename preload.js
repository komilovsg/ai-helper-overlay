contextBridge.exposeInMainWorld("electronAPI", {
  onReply: (callback) =>
    ipcRenderer.on("chatgpt-reply", (event, value) => callback(value)),
  sendToGPT: (text) => ipcRenderer.send("voice-input", text),
});
