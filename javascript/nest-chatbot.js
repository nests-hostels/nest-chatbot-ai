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
    locale: 'en', // @todo: browser detect preference or from website HTML lang="" attr
    message: null,
    file: {
        data: null,
        mime_type: null,
    },
};

// Store chat history
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;
console.info(initialInputHeight);

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

    try {
        // Fetch bot response from API
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extract and display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;

        // Add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }],
        });
        console.info(chatHistory);
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
    messageInput.value = "";
    messageInput.dispatchEvent(new Event("input"));
    fileUploadWrapper.classList.remove("file-uploaded");

    // Create and display user message
    const messageContent = `<div class="message-text"></div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
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


// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

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
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));