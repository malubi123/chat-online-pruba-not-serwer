const GIST_URL = 'https://gist.github.com/malubi123/0708a492f08d205309527dff28c72558'; // Zamień na ID swojego Gista

document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const tokenInput = document.getElementById("token");
    const messageInput = document.getElementById("message");
    const sendBtn = document.getElementById("sendBtn");
    const messagesContainer = document.getElementById("messages");

    // Load user data from local storage
    const storedUser = JSON.parse(sessionStorage.getItem('user')); // Użyj sessionStorage
    if (storedUser) {
        usernameInput.value = storedUser.username;
    }

    // Load messages from GitHub Gist
    loadMessages();

    // Send message function
    sendBtn.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const token = tokenInput.value.trim();
        const message = messageInput.value.trim();

        if (username && token && message) {
            const timestamp = new Date();
            const messageData = {
                username: username,
                text: message,
                time: timestamp.toLocaleString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }),
            };

            if (checkUniqueUsername()) {
                saveUserData(username, token);
                saveMessage(messageData, token);
                messageInput.value = ""; // Clear the input
            } else {
                alert("Nazwa użytkownika już istnieje. Wybierz inną.");
                usernameInput.value = ''; // Clear username input
            }
        } else {
            alert("Proszę wprowadzić wszystkie dane.");
        }
    });

    // Load messages from GitHub Gist
    function loadMessages() {
        fetch(GIST_URL)
            .then(response => response.json())
            .then(data => {
                const messages = JSON.parse(data.files['messages.json'].content) || [];
                renderMessages(messages);
            });
    }

    // Save message to GitHub Gist
    function saveMessage(messageData, token) {
        fetch(GIST_URL)
            .then(response => response.json())
            .then(data => {
                const messages = JSON.parse(data.files['messages.json'].content) || [];
                messages.push(messageData);
                updateGist(messages, token);
            });
    }

    // Update the gist with new messages
    function updateGist(messages, token) {
        fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`
            },
            body: JSON.stringify({
                files: {
                    'messages.json': {
                        content: JSON.stringify(messages)
                    }
                }
            })
        }).then(() => loadMessages());
    }

    // Render messages
    function renderMessages(messages) {
        messagesContainer.innerHTML = messages
            .map(msg => `<div class="message"><strong>${msg.username} [${msg.time}]:</strong> ${msg.text}</div>`)
            .join("");
    }

    // Save user data to session storage
    function saveUserData(username, token) {
        const user = { username, token };
        sessionStorage.setItem('user', JSON.stringify(user)); // Użyj sessionStorage
    }

    // Check if username is unique
    function checkUniqueUsername() {
        const username = usernameInput.value.trim();
        const messages = JSON.parse(sessionStorage.getItem('messages')) || []; // Retrieve messages from sessionStorage
        return !messages.some(msg => msg.username === username);
    }
});
