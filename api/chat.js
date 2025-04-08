// Элементы DOM
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

// Функция отправки сообщения через HTTP
async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        if (response.ok) {
            chatInput.value = ''; // Очистка поля ввода
        } else {
            console.error('Failed to send message:', response.status);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Функция получения сообщений (polling)
async function fetchMessages() {
    try {
        const response = await fetch('/api/chat');
        const messages = await response.json();
        chatMessages.innerHTML = ''; // Очистка текущих сообщений
        messages.forEach(msg => {
            const message = document.createElement('div');
            message.classList.add('message');
            message.textContent = msg;
            chatMessages.appendChild(message);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight; // Прокрутка вниз
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Обработчики событий
sendButton.addEventListener('click', () => {
    console.log('Send button clicked');
    sendChatMessage();
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter pressed');
        sendChatMessage();
    }
});

// Периодический опрос сообщений каждые 2 секунды
setInterval(fetchMessages, 2000);

// Начальная загрузка сообщений
fetchMessages();
