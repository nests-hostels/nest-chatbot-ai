document.addEventListener('DOMContentLoaded', function () {
    const chatBody = document.querySelector(".chat-body");
    const messageInput = document.querySelector(".message-input");
    const sendMessage = document.querySelector("#send-message");
    const fileInput = document.querySelector("#file-input");
    const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
    const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
    const chatbotToggler = document.querySelector("#chatbot-toggler");
    const closeChatbot = document.querySelector("#close-chatbot");

    // API setup
    const API_KEY = "AIzaSyCQXdM8mF1o7j7KlC2ue75X37ZIU_cDTVk";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

    /**
     * Initialize user message and file data
     * {
     *    "conversation_uuid": "NULL or String ex: j312l-mkl321-312kl-k342l",
     *    "locale": "String ex: it_IT or en_US... The prefered locale of the user",
     *    "message": "String: The user message with the question or intention...",
     *    // future implementation
     *    'user_id'
     * }
     */
    const userData = {
        conversation_uuid: null,
        locale: document.querySelector('html').getAttribute('lang') ?? 'en',
        message: null,
        file: {
            data: null,
            mime_type: null,
        },
    };

    // Store chat history
    const chatHistory = [];
    const initialInputHeight = 49;

    // Create message element with dynamic classes and return it
    const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
    };

    /** 
     * Generate bot response using API
     * 
     * @HTMLObject div of the message for get the text
     * 
     * @return void()
     */
    const generateBotResponse = async (incomingMessageDiv) => {
        const messageElement = incomingMessageDiv.querySelector(".message-text");

        // Add user message to chat history
        chatHistory.push({
            role: "user",
            parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
        });

        // API request options
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatHistory, // @todo: define the length of history
            }),
        };


        // DEBUG
        messageElement.innerText = 'Received';
        // Add Assistant response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: 'Received' }],
        });

        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        userData.conversation_uuid = (userData.conversation_uuid == null) ? new Date().getTime() : userData.conversation_uuid;

        return true;
        // DEBUG
        try {
            // Fetch bot response from API
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message);

            // Extract and display bot's response text
            const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
            messageElement.innerText = apiResponseText;

            // Add Assistant response to chat history
            chatHistory.push({
                role: "model",
                parts: [{ text: apiResponseText }],
            });
        } catch (error) {
            // Handle error in API response
            console.log(error);
            messageElement.innerText = error.message;
            messageElement.style.color = "#ff0000";
        } finally {
            // Reset user's file data, removing thinking indicator and scroll chat to bottom
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        }
    };

    /** 
     * Handle outgoing user messages
     * 
     * @event e For prevent default
     * 
     * @return void() Calling startBotResponse()
     */
    const handleOutgoingMessage = (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim(); // @todo: maxLength?
        if (userData.message.length < 2) {
            return false;
        }
        messageInput.value = "";
        messageInput.dispatchEvent(new Event("input"));
        fileUploadWrapper.classList.remove("file-uploaded");

        // Create and display user message
        const messageContent = `<div class="message-text"></div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");

        // DEBUG
        outgoingMessageDiv.querySelector(".message-text").innerHTML = `<code class="code">{ <br/>
        "conversation_uuid": ${userData.conversation_uuid},<br/>
        "message": "${userData.message}",<br/>
        "locale": "${userData.locale}",<br/>
    }</code>`;
        // DEBUG

        chatBody.appendChild(outgoingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });


        startBotResponse();
    };

    /**
     * Start the assistant response with the logo and thinking indicator
     */
    function startBotResponse() {
        const messageContent = `<img class="bot-avatar" src="./img/Ibiza-a21caf.png" alt="Chatbot Logo" width="50" height="50">
        </img>
        <div class="message-text">
        <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
        </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

        // Assistant response with thinking indicator after a delay
        setTimeout(() => {
            generateBotResponse(incomingMessageDiv);
        }, 1600);
    }


    /**
     * Adjust input field height dynamically
     */
    // Create a reusable function for adjusting textarea height
    function adjustInputHeight() {
        // Reset height to "auto" to properly collapse when content is removed
        messageInput.style.height = "auto";

        // Determine the new height - either the scrollHeight or initialInputHeight, whichever is larger
        const newHeight = Math.max(initialInputHeight, messageInput.scrollHeight);

        // Set to the appropriate height
        messageInput.style.height = `${newHeight}px`;

        // Adjust border radius based on whether we're at initial height or not
        document.querySelector(".chat-form").style.borderRadius =
            newHeight > initialInputHeight ? "15px" : "32px";
    }

    // Call the function on page load to handle any existing content
    window.addEventListener("DOMContentLoaded", adjustInputHeight);

    // Call the function whenever input changes
    messageInput.addEventListener("input", adjustInputHeight);



    // Handle Enter key press for sending messages
    messageInput.addEventListener("keydown", (e) => {
        const userMessage = e.target.value.trim();
        if (e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768) {
            handleOutgoingMessage(e);
        }
    });

    // Handle file input change and preview the selected file
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            fileInput.value = "";
            fileUploadWrapper.querySelector("img").src = e.target.result;
            fileUploadWrapper.classList.add("file-uploaded");
            const base64String = e.target.result.split(",")[1];

            // Store file data in userData
            userData.file = {
                data: base64String,
                mime_type: file.type,
            };
        };

        reader.readAsDataURL(file);
    });

    // Cancel file upload
    fileCancelButton.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("file-uploaded");
    });

    sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
    document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

    /* Open Close Chat */
    closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => {
        document.body.classList.toggle("show-chatbot");

        // Start Animation
        // if (document.body.classList.contains("show-chatbot")) {
        startAnimationSequence();
    });



    // Animation Loader of Chat Bot
    function startAnimationSequence() {
        const circularProgress = document.querySelector('#chatLoader .circular-progress');
        const chatLoader = document.querySelector('#chatLoader');
        const firstBotMessage = document.querySelector('#firstBotMessage');

        // Start the animation sequence
        circularProgress.classList.add('animate-sequence');

        // Add a pulse animation while the progress is running
        circularProgress.classList.add('pulse-animation');

        // Using the animationend event to sequence animations
        circularProgress.addEventListener('animationend', function (e) {
            // Only proceed if it was the progress-animation that ended
            if (e.animationName === 'progress-animation') {
                // Remove pulse and start logo animation
                // circularProgress.classList.remove('pulse-animation');
                circularProgress.classList.add('logo-animation');

                // After a short delay, hide the loader and show the message
                setTimeout(() => {
                    chatLoader.classList.add('hidden-loader');

                    // After loader starts disappearing, show the first message
                    setTimeout(() => {
                        chatLoader.classList.add('hidden');
                        firstBotMessage.classList.add('visible');

                        // Trigger visibility animation after DOM update
                        requestAnimationFrame(() => {
                            firstBotMessage.classList.add('visible');
                        });
                    }, 900); // Delay showing message slightly
                }, 800); // Give time for logo animation to be noticed
            }
        });
    }



    /** Language Menu selector */
    const languageToggle = document.getElementById('language-toggle');
    const chatContainer = document.querySelector('.chat-container');
    const languageOptions = document.querySelector('.language-options');
    const languageOptionButtons = document.querySelectorAll('.language-option');

    /**
     * Imposta la bandiera corretta nel selettore principale in base alla lingua corrente
     */
    function initializeLanguageSelector() {
        // Verifica che userData esista e abbia una proprietà locale
        if (userData.locale) {
            const currentLocale = userData.locale;

            // Cerca l'opzione lingua che corrisponde alla locale corrente
            const matchingOption = document.querySelector(`.language-option[data-lang="${currentLocale}"]`);

            if (matchingOption) {
                // Ottieni l'URL della bandiera e l'attributo alt
                const flagUrl = matchingOption.querySelector('.flag-icon').src;
                const flagAlt = matchingOption.querySelector('.flag-icon').getAttribute('alt');

                // Imposta la bandiera nel selettore principale
                const mainFlag = languageToggle.querySelector('.flag-icon');
                mainFlag.src = flagUrl;
                mainFlag.setAttribute('data-lang', currentLocale);
                mainFlag.setAttribute('alt', flagAlt);

                // Nascondi questa opzione nel selettore
                matchingOption.classList.add('hidden');

                // Aggiorna anche il placeholder del textarea
                updatePlaceholder(currentLocale);
            }
        }
    }
    initializeLanguageSelector();

    // Funzione per aprire/chiudere il menu lingue
    function toggleLanguageMenu() {
        const isOpening = !chatContainer.classList.contains('language-menu-open');

        chatContainer.classList.toggle('language-menu-open');

        // Se stiamo aprendo, mostra le lingue disponibili
        if (isOpening) {
            languageOptionButtons.forEach(button => {
                if (userData.locale !== button.getAttribute('data-lang')) {
                    button.classList.remove('hidden');
                } else {
                    button.classList.add('hidden');
                }
            });
        }
    }

    // Click sul bottone della lingua
    languageToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleLanguageMenu();
    });

    // Click sulle opzioni lingua
    languageOptionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();

            // Nascondi questa opzione
            this.classList.add('hidden');

            // Mostra la lingua precedentemente selezionata
            const previousLang = userData.locale;
            const previousButton = document.querySelector(`.language-option[data-lang="${previousLang}"]`);
            if (previousButton) {
                previousButton.classList.remove('hidden');
            }

            // Aggiorna la lingua selezionata
            userData.locale = this.getAttribute('data-lang');
            const flagUrl = this.querySelector('.flag-icon').src;

            // Aggiorna la bandiera principale
            const mainFlag = languageToggle.querySelector('.flag-icon');
            mainFlag.src = flagUrl;
            mainFlag.setAttribute('data-lang', userData.locale);
            mainFlag.setAttribute('alt', this.querySelector('.flag-icon').getAttribute('alt'));

            // Chiudi il menu
            toggleLanguageMenu();

            // Aggiorna il placeholder del textarea se necessario
            updatePlaceholder(userData.locale);
        });
    });

    // Chiudi il menu quando si clicca all'esterno
    document.addEventListener('click', function () {
        if (chatContainer.classList.contains('language-menu-open')) {
            toggleLanguageMenu();
        }
    });

    // Impedisci che il click sul menu si propaghi al documento
    languageOptions.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // Funzione per aggiornare il placeholder in base alla lingua
    function updatePlaceholder(locale) {
        const messageInput = document.querySelector('.message-input');
        const placeholders = {
            'en': 'Message...',
            'it': 'Messaggio...',
            'es': 'Mensaje...',
            'de': 'Nachricht...',
            'fr': 'Message...'
        };

        messageInput.placeholder = placeholders[locale] || placeholders['en'];
    }
});