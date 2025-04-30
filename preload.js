const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendToGPT: (text) => ipcRenderer.send("text-input", text),
  onChatGptReply: (callback) => {
    ipcRenderer.on("chatgpt-reply", (_event, reply) => {
      callback(reply); // <-- вот так, только `reply`, без `event`
    });
  },
});
