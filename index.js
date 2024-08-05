// document.addEventListener('DOMContentLoaded', () => {
//   const fromText = document.querySelector(".from-text"),
//     toText = document.querySelector(".to-text"),
//     exchangeIcon = document.querySelector(".exchange"),
//     selectTag = document.querySelectorAll("select"),
//     icons = document.querySelectorAll(".row i"),
//     translateBtn = document.querySelector(".translate-btn"),
//     summarizeBtn = document.querySelector(".summarize-btn"),
//     apiRadios = document.querySelectorAll('input[name="api"]'); // радио бутоните за избор на API

//   let isTranslating = false; // Flag to check if translation is in progress
//   let isSummarizing = false; // Flag to check if summarizing is in progress

//   // Функция за показване на предупреждение
//   function showTranslateApiAlert() {
//     alert('Translate API is not currently available.');
//   }

//   // Функция за проверка на наличността на Translate API
//   function checkTranslateApiAvailability() {
//     window.translateApiAvailable = false;
//   }

//   // Извършете проверка на наличността на Translate API при зареждане на страницата
//   checkTranslateApiAvailability();

//   // Слушател за промяна на избора на API
//   apiRadios.forEach(radio => {
//     radio.addEventListener('change', (event) => {
//       if (event.target.value === 'translate' && !window.translateApiAvailable) {
//         showTranslateApiAlert();
//       }
//     });
//   });

//   // избор на държави
//   selectTag.forEach((tag, id) => {
//     for (let country_code in countries) {
//       let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "bg-BG" ? "selected" : "";
//       let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
//       tag.insertAdjacentHTML("beforeend", option);
//     }
//   });

//   // променяне на текста
//   exchangeIcon.addEventListener("click", () => {
//     let tempText = fromText.value,
//       tempLang = selectTag[0].value;
//     fromText.value = toText.value;
//     toText.value = tempText;
//     selectTag[0].value = selectTag[1].value;
//     selectTag[1].value = tempLang;
//   });

//   // изчистване на текст
//   fromText.addEventListener("keyup", () => {
//     if (!fromText.value) {
//       toText.value = "";
//     }
//   });

//   // инициализиране на ai
//   async function initializeSession() {
//     const canCreate = await window.ai.canCreateTextSession();
//     if (canCreate === "no") {
//       console.error("The model is not available on this device.");
//       return null;
//     }
//     const session = await window.ai.createTextSession();
//     return session;
//   }

//   // Translate text using Prompt API
//   async function translateUsingPromptAPI(session, text, targetLanguage) {
//     const stream = session.promptStreaming(`Translate the following text to ${targetLanguage}: ${text}`);
//     let translation = "";
//     for await (const chunk of stream) {
//       translation += chunk;
//     }
//     return translation;
//   }

//   // Translate text using Translation API
//   async function translateUsingTranslateAPI(text, targetLanguage) {
//     const response = await fetch('https://translation.googleapis.com/language/translate/v2', { // Example URL, replace with actual endpoint
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer YOUR_API_KEY` // Replace with your actual API key
//       },
//       body: JSON.stringify({
//         q: text,
//         target: targetLanguage
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`Translation API error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data.data.translations[0].translatedText;
//   }

//   // превод при цъкване на бутона
//   translateBtn.addEventListener("click", async () => {
//     if (isSummarizing) return; // Prevent translation if summarization is in progress

//     const text = fromText.value.trim();
//     const translateFrom = selectTag[0].value;
//     const translateTo = selectTag[1].value;
//     if (!text) return;

//     isTranslating = true; // Set the flag to true
//     translateBtn.disabled = true; // Disable the button

//     const selectedApi = document.querySelector('input[name="api"]:checked').value;

//     if (selectedApi === 'translate' && !window.translateApiAvailable) {
//       showTranslateApiAlert();
//       translateBtn.disabled = false; // Re-enable the button
//       isTranslating = false; // Reset the flag
//       return;
//     }

//     let translation;
//     if (selectedApi === 'prompt') {
//       const session = await initializeSession();
//       if (!session) {
//         toText.setAttribute("placeholder", "Translation");
//         translateBtn.disabled = false; // Re-enable the button
//         isTranslating = false; // Reset the flag
//         return;
//       }
//       toText.setAttribute("placeholder", "Translating...");
//       translation = await translateUsingPromptAPI(session, text, translateTo);
//     } else {
//       toText.setAttribute("placeholder", "Translating...");
//       try {
//         translation = await translateUsingTranslateAPI(text, translateTo);
//       } catch (error) {
//         console.error(error);
//         showTranslateApiAlert();
//         translateBtn.disabled = false; // Re-enable the button
//         isTranslating = false; // Reset the flag
//         return;
//       }
//     }

//     toText.value = translation;
//     toText.setAttribute("placeholder", "Translation");
//     translateBtn.disabled = false; // Re-enable the button
//     isTranslating = false; // Reset the flag
//   });

//   // синтез на речта
//   icons.forEach(icon => {
//     icon.addEventListener("click", ({ target }) => {
//       if (!fromText.value || !toText.value) return;
//       if (target.classList.contains("fa-copy")) { // бутон за копиране
//         if (target.id == "from") {
//           navigator.clipboard.writeText(fromText.value);
//         } else {// бутон за говорене
//           navigator.clipboard.writeText(toText.value);
//         }
//       } else {
//         let utterance;
//         if (target.id == "from") {
//           utterance = new SpeechSynthesisUtterance(fromText.value);
//           utterance.lang = selectTag[0].value;
//         } else {
//           utterance = new SpeechSynthesisUtterance(toText.value);
//           utterance.lang = selectTag[1].value;
//         }
//         speechSynthesis.speak(utterance);
//       }
//     });
//   });

//   // инициализиране на аи при сумиране
//   async function initializeSummarizeSession() {
//     const canCreate = await window.ai.canCreateTextSession();
//     if (canCreate === "no") {
//       console.error("The model is not available on this device.");
//       return null;
//     }
//     const session = await window.ai.createTextSession();
//     return session;
//   }

//   // обобщение на текста
//   async function summarizeText(session, text) {
//     const prompt = `Summarize the following text: ${text}`;
//     const result = await session.prompt(prompt);
//     return result;
//   }

//   // Summarize при цъкване на бутона
//   summarizeBtn.addEventListener("click", async () => {
//     if (isTranslating) return; // Prevent summarizing if translation is in progress

//     const text = fromText.value.trim();
//     if (!text) return;

//     isSummarizing = true; // Set the flag to true
//     summarizeBtn.disabled = true; // Disable the button

//     toText.setAttribute("placeholder", "Summarizing...");

//     const session = await initializeSummarizeSession();
//     if (!session) {
//       toText.setAttribute("placeholder", "Summary");
//       summarizeBtn.disabled = false; // Re-enable the button
//       isSummarizing = false; // Reset the flag
//       return;
//     }

//     const summary = await summarizeText(session, text);
//     toText.value = summary;
//     toText.setAttribute("placeholder", "Summary");
//     summarizeBtn.disabled = false; // Re-enable the button
//     isSummarizing = false; // Reset the flag
//   });
// });




document.addEventListener('DOMContentLoaded', () => {
  const fromText = document.querySelector(".from-text"),
        toText = document.querySelector(".to-text"),
        exchangeIcon = document.querySelector(".exchange"),
        selectTag = document.querySelectorAll("select"),
        icons = document.querySelectorAll(".row i"),
        translateBtn = document.querySelector(".translate-btn"),
        summarizeBtn = document.querySelector(".summarize-btn"),
        apiRadios = document.querySelectorAll('input[name="api"]'); // Радио бутоните за избор на API

  let isTranslating = false; // Flag to check if translation is in progress
  let isSummarizing = false; // Flag to check if summarizing is in progress

  // Функция за показване на предупреждение
  function showTranslateApiAlert() {
    alert('Translate API is not currently available.');
  }

  // Функция за проверка на наличността на Translate API
  function checkTranslateApiAvailability() {
    window.translateApiAvailable = false;
  }

  // Извършете проверка на наличността на Translate API при зареждане на страницата
  checkTranslateApiAvailability();

  // Слушател за промяна на избора на API
  apiRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'translate' && !window.translateApiAvailable) {
        showTranslateApiAlert();
      }
    });
  });

  // Избор на държави
  selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
      let selected = id === 0 ? country_code === "en-GB" ? "selected" : "" : country_code === "bg-BG" ? "selected" : "";
      let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
      tag.insertAdjacentHTML("beforeend", option);
    }
  });

  // Променяне на текста
  exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
  });

  // Изчистване на текст
  fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
      toText.value = "";
    }
  });

  // Инициализиране на AI
  async function initializeSession() {
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
      console.error("The model is not available on this device.");
      return null;
    }
    const session = await window.ai.createTextSession();
    return session;
  }

  // Translate text using Prompt API with streaming
  async function translateUsingPromptAPI(session, text, targetLanguage) {
    const stream = session.promptStreaming(`Translate the following text to ${targetLanguage}: ${text}`);
    let result = '';
    let previousLength = 0;

    for await (const chunk of stream) {
      const newContent = chunk.slice(previousLength);
      console.log(newContent); // Optional: log new content for debugging
      previousLength = chunk.length;
      result += newContent;
    }

    console.log(result); // Optional: log the final result for debugging
    return result;
  }

  // Translate text using Translation API
  async function translateUsingTranslateAPI(text, targetLanguage) {
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', { // Example URL, replace with actual endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_API_KEY` // Replace with your actual API key
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  // Превод при цъкване на бутона
  translateBtn.addEventListener("click", async () => {
    if (isSummarizing) return; // Prevent translation if summarization is in progress

    const text = fromText.value.trim();
    const translateFrom = selectTag[0].value;
    const translateTo = selectTag[1].value;
    if (!text) return;

    isTranslating = true; // Set the flag to true
    translateBtn.disabled = true; // Disable the button

    const selectedApi = document.querySelector('input[name="api"]:checked').value;

    if (selectedApi === 'translate' && !window.translateApiAvailable) {
      showTranslateApiAlert();
      translateBtn.disabled = false; // Re-enable the button
      isTranslating = false; // Reset the flag
      return;
    }

    let translation;
    if (selectedApi === 'prompt') {
      const session = await initializeSession();
      if (!session) {
        toText.setAttribute("placeholder", "Translation");
        translateBtn.disabled = false; // Re-enable the button
        isTranslating = false; // Reset the flag
        return;
      }
      toText.setAttribute("placeholder", "Translating...");
      translation = await translateUsingPromptAPI(session, text, translateTo);
    } else {
      toText.setAttribute("placeholder", "Translating...");
      try {
        translation = await translateUsingTranslateAPI(text, translateTo);
      } catch (error) {
        console.error(error);
        showTranslateApiAlert();
        translateBtn.disabled = false; // Re-enable the button
        isTranslating = false; // Reset the flag
        return;
      }
    }

    toText.value = translation;
    toText.setAttribute("placeholder", "Translation");
    translateBtn.disabled = false; // Re-enable the button
    isTranslating = false; // Reset the flag
  });

  // Синтез на речта
  icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
      if (!fromText.value || !toText.value) return;
      if (target.classList.contains("fa-copy")) { // Бутон за копиране
        if (target.id === "from") {
          navigator.clipboard.writeText(fromText.value);
        } else { // Бутон за говорене
          navigator.clipboard.writeText(toText.value);
        }
      } else {
        let utterance;
        if (target.id === "from") {
          utterance = new SpeechSynthesisUtterance(fromText.value);
          utterance.lang = selectTag[0].value;
        } else {
          utterance = new SpeechSynthesisUtterance(toText.value);
          utterance.lang = selectTag[1].value;
        }
        speechSynthesis.speak(utterance);
      }
    });
  });

  // Инициализиране на AI при сумиране
  async function initializeSummarizeSession() {
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
      console.error("The model is not available on this device.");
      return null;
    }
    const session = await window.ai.createTextSession();
    return session;
  }

  // Обобщение на текста
  async function summarizeText(session, text) {
    const prompt = `Summarize the following text: ${text}`;
    const result = await session.prompt(prompt);
    return result;
  }

  // Summarize при цъкване на бутона
  summarizeBtn.addEventListener("click", async () => {
    if (isTranslating) return; // Prevent summarizing if translation is in progress

    const text = fromText.value.trim();
    if (!text) return;

    isSummarizing = true; // Set the flag to true
    summarizeBtn.disabled = true; // Disable the button

    toText.setAttribute("placeholder", "Summarizing...");

    const session = await initializeSummarizeSession();
    if (!session) {
      toText.setAttribute("placeholder", "Summary");
      summarizeBtn.disabled = false; // Re-enable the button
      isSummarizing = false; // Reset the flag
      return;
    }

    const summary = await summarizeText(session, text);
    toText.value = summary;
    toText.setAttribute("placeholder", "Summary");
    summarizeBtn.disabled = false; // Re-enable the button
    isSummarizing = false; // Reset the flag
  });
});
