//main.js
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

require("dotenv").config();
// const token = process.env.OPENAI_API_KEY;
// const token = process.env.DEEPSEEKAI_API_KEY;
const token = process.env.FREEDEEPSEEKAI_API_KEY;
console.log("Token:", token);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 450,
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

async function sendToChatGPT(prompt) {
  try {
    const response = await axios.post(
      // "https://api.openai.com/v1/chat/completions",
      // "https://api.deepseek.com/v1/query",
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // model: "gpt-3.5-turbo",
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content:
              "Ты ассистент программиста на собеседовании, думай как специалист уровня мидл, с ильными навыками во всем, экспертностью и с опытом 7 лет",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response?.data?.choices?.[0]?.message?.content;
    if (reply) {
      win.webContents.send("chatgpt-reply", reply);
    } else {
      win.webContents.send(
        "chatgpt-reply",
        "❌ Ошибка: Пустой ответ от модели."
      );
    }
  } catch (err) {
    const message =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Произошла неизвестная ошибка.";
    console.error("Error sending to GPT:", message);
    win.webContents.send("chatgpt-reply", `❌ Ошибка: ${message}`);
  }
}

//text
ipcMain.on("text-input", async (event, userInput) => {
  console.log("Text Input:", userInput); // должно быть на русском

  sendToChatGPT(userInput);
});

//voice
ipcMain.on("voice-input", (event, text) => {
  console.log("Voice Input:", text);
  sendToChatGPT(text);
});
