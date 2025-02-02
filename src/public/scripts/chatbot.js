function initializeChatbot() {
    const openChatButton = document.getElementById('open-chat');
    const closeChatButton = document.getElementById('close-chat');
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('gc-typing-indicator');

    function setLoadingState(isLoading) {
        // Show/hide typing indicator
        typingIndicator.classList.toggle('gc-hidden', !isLoading);
        
        // Disable/enable input and send button
        userInput.disabled = isLoading;
        sendButton.disabled = isLoading;
        
        // Scroll to bottom to show loading indicator
        if (isLoading) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    function formatBotMessage(content) {
        // Split the content into numbered points if it contains numbers followed by periods
        const formattedContent = content.replace(/(\d+)\.\s+/g, '\n$1. ');
        
        // Convert the content to HTML using marked
        const htmlContent = marked.parse(formattedContent);
        
        return htmlContent;
    }

    function appendMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('gc-message');
        messageElement.classList.add(sender === 'user' ? 'gc-user-message' : 'gc-bot-message');
        
        if (sender === 'bot') {
            // Format bot messages with markdown and styling
            messageElement.innerHTML = formatBotMessage(content);
        } else {
            // User messages remain as plain text
            messageElement.textContent = content;
        }
        
        // Insert message before the typing indicator
        typingIndicator.parentNode.insertBefore(messageElement, typingIndicator);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Clear input and append user message
        userInput.value = '';
        appendMessage(message, 'user');

        // Show loading state
        setLoadingState(true);

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Hide loading state
            setLoadingState(false);

            if (data.error) {
                throw new Error(data.error);
            }

            const botMessage = data.reply;
            appendMessage(botMessage, 'bot');
        } catch (error) {
            console.error('Error in sendMessage:', error);
            // Hide loading state
            setLoadingState(false);
            appendMessage('Sorry, something went wrong. Please try again later.', 'bot');
        }
    }

    // Event Listeners
    openChatButton.addEventListener('click', () => {
        chatContainer.classList.remove('gc-hidden');
        openChatButton.classList.add('gc-hidden');
    });

    closeChatButton.addEventListener('click', () => {
        chatContainer.classList.add('gc-hidden');
        openChatButton.classList.remove('gc-hidden');
    });

    sendButton.addEventListener('click', () => {
        if (!userInput.disabled) {
            sendMessage();
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !userInput.disabled) {
            sendMessage();
        }
    });

    // Initialize with loading indicator hidden
    setLoadingState(false);
}

// Initialize when document is ready
if (document.readyState === 'complete') {
    initializeChatbot();
} else {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
}