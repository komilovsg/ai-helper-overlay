// main.js - точка входа для Electron
require("dotenv").config();

const {
  app,
  BrowserWindow,
  globalShortcut,
  desktopCapturer,
  ipcMain,
} = require("electron");
const path = require("path");
const Tesseract = require("tesseract.js");
const axios = require("axios");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 300,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Shift+A", async () => {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    const screenshot = sources[0].thumbnail.toPNG();

    Tesseract.recognize(screenshot, "eng").then(({ data: { text } }) => {
      console.log("OCR Text:", text);
      sendToChatGPT(text);
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// Функция отправки текста в ChatGPT
async function sendToChatGPT(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Ты ассистент программиста на собеседовании",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const reply = response.data.choices[0].message.content;
    win.webContents.send("chatgpt-reply", reply);
  } catch (err) {
    console.error("Error sending to GPT:", err);
  }
}

// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onReply: (callback) =>
    ipcRenderer.on("chatgpt-reply", (event, value) => callback(value)),
});
