const button = document.getElementById("voice");

button.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.start();

  button.textContent = "⏹️ Стоп"; // Меняем текст кнопки на "Стоп"

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    document.getElementById("output").textContent =
      "🎧 Распознано: " + spokenText;

    // Отправляем на обработку в Electron
    window.electronAPI.sendToGPT(spokenText);
  };

  // Обработка ошибки распознавания
  recognition.onerror = (event) => {
    document.getElementById("output").textContent =
      "Ошибка распознавания: " + event.error;
  };

  // Восстановление текста кнопки через 5 секунд
  setTimeout(() => {
    button.textContent = "🎙️ Сказать";
  }, 5000);
});
