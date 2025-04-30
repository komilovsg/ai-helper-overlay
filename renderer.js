//renderer.js
const button = document.getElementById("voice");
const sendButton = document.getElementById("sendButton");
const inputText = document.getElementById("inputText");
const outputDiv = document.getElementById("output");
const responseDiv = document.getElementById("response");

// Обработчик для кнопки записи речи
button.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.start();

  button.textContent = "⏹️ Стоп"; // Меняем текст кнопки на "Стоп"

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    outputDiv.textContent = "🎧 Распознано: " + spokenText;

    // Отправляем распознанный текст на обработку в Electron
    window.electronAPI.sendToGPT(spokenText);
  };

  // Обработка ошибки распознавания
  recognition.onerror = (event) => {
    outputDiv.textContent = "Ошибка распознавания: " + event.error;
  };

  // Восстановление текста кнопки через 5 секунд
  setTimeout(() => {
    button.textContent = "🎙️ Сказать";
  }, 5000);
});

// Обработчик для кнопки отправки текста
sendButton.addEventListener("click", () => {
  const text = inputText.value.trim();
  if (text) {
    console.log("Send Text:", text);
    outputDiv.textContent = "Отправлено: " + text;

    // Отправляем текст из поля ввода на обработку в Electron
    window.electronAPI.sendToGPT(text);
  }
});

// Получаем ответ от ChatGPT и отображаем его
window.electronAPI.onChatGptReply((reply) => {
  console.log("Ответ от ChatGPT:", reply); // Логируем ответ
  const formatted =
    typeof reply === "object" ? JSON.stringify(reply, null, 2) : reply;
  responseDiv.innerHTML = `<strong>Ответ:</strong><pre>${formatted}</pre>`;
});
