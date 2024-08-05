document.addEventListener('DOMContentLoaded', () => {
  const fromText = document.querySelector(".from-text"),
        toText = document.querySelector(".to-text"),
        exchangeIcon = document.querySelector(".exchange"),
        selectTag = document.querySelectorAll("select"),
        icons = document.querySelectorAll(".row i"),
        translateBtn = document.querySelector(".translate-btn"),
        summarizeBtn = document.querySelector(".summarize-btn"),
        apiRadios = document.querySelectorAll('input[name="api"]'); 

  let isTranslating = false; 
  let isSummarizing = false; 

  //функция за показване на предупреждение
  function showTranslateApiAlert() {
    alert('Translate API is not working now.');
  }

  //функция за проверка на наличността на Translate API
  function checkTranslateApiAvailability() {
    window.translateApiAvailable = false;
  }

  //извършете проверка на наличността на Translate API при зареждане на страницата
  checkTranslateApiAvailability();

  //промяна на избора на API
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

  //променяне на текста
  exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
  });

  //изчистване на текст
  fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
      toText.value = "";
    }
  });

  //инициализиране на AI
  async function initializeSession() {
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
      console.error("The model is not available on this device..");
      return null;
    }
    const session = await window.ai.createTextSession();
    return session;
  }

  //превод на текста с Prompt API и стрийминг
  async function translateUsingPromptAPI(session, text, targetLanguage) {
    const stream = session.promptStreaming(`Translate the following text to ${targetLanguage}: ${text}`);
    let result = '';
    let previousLength = 0;

    toText.setAttribute("placeholder", "Initialization...");
    for await (const chunk of stream) {
      const newContent = chunk.slice(previousLength);
      result += newContent;
      toText.value = result; 
      previousLength = chunk.length;
    }

    console.log(result); 
    return result;
  }

  //превод на текста с Translation API
  async function translateUsingTranslateAPI(text, targetLanguage) {
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', { // Примерен URL, заменете с реален
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_API_KEY` // Заменете с вашия реален API ключ
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Error for Translation API: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  //превод при натискане на бутона
  translateBtn.addEventListener("click", async () => {
    if (isSummarizing) return;

    const text = fromText.value.trim();
    const translateFrom = selectTag[0].value;
    const translateTo = selectTag[1].value;
    if (!text) return;

    isTranslating = true; 
    translateBtn.disabled = true;

    const selectedApi = document.querySelector('input[name="api"]:checked').value;

    if (selectedApi === 'translate' && !window.translateApiAvailable) {
      showTranslateApiAlert();
      translateBtn.disabled = false; 
      isTranslating = false; 
      return;
    }

    let translation;
    if (selectedApi === 'prompt') {
      const session = await initializeSession();
      if (!session) {
        toText.setAttribute("placeholder", "Translation");
        translateBtn.disabled = false; // Активирайте отново бутона
        isTranslating = false; // Нулирайте флага
        return;
      }
      translation = await translateUsingPromptAPI(session, text, translateTo);
    } else {
      try {
        translation = await translateUsingTranslateAPI(text, translateTo);
      } catch (error) {
        console.error(error);
        showTranslateApiAlert();
        translateBtn.disabled = false; 
        isTranslating = false; 
        return;
      }
    }

    toText.value = translation;
    toText.setAttribute("placeholder", "Translation");
    translateBtn.disabled = false; 
    isTranslating = false; 
  });

  //синтез на речта
  icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
      if (!fromText.value || !toText.value) return;
      if (target.classList.contains("fa-copy")) { //бутон за копиране
        if (target.id === "from") {
          navigator.clipboard.writeText(fromText.value);
        } else { // бутон за копиране на превод
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

  // инициализиране на AI при обобщаване
  async function initializeSummarizeSession() {
    const canCreate = await window.ai.canCreateTextSession();
    if (canCreate === "no") {
      console.error("The model is not available on this device.");
      return null;
    }
    const session = await window.ai.createTextSession();
    return session;
  }

  // обобщение на текста
  async function summarizeText(session, text) {
    const prompt = `Summarize: ${text}`;
    const result = await session.prompt(prompt);
    return result;
  }

  // обобщение при натискане на бутона
  summarizeBtn.addEventListener("click", async () => {
    if (isTranslating) return; 

    const text = fromText.value.trim();
    if (!text) return;

    isSummarizing = true; 
    summarizeBtn.disabled = true; 

    toText.setAttribute("placeholder", "Summarizing...");

    const session = await initializeSummarizeSession();
    if (!session) {
      toText.setAttribute("placeholder", "Summarize");
      summarizeBtn.disabled = false; 
      isSummarizing = false; 
      return;
    }

    const summary = await summarizeText(session, text);
    toText.value = summary;
    toText.setAttribute("placeholder", "Summarize");
    summarizeBtn.disabled = false; 
    isSummarizing = false;   
  });
});

