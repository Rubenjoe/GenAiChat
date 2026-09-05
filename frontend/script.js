// State Management
let currentConversation = {
    id: null,
    title: 'New conversation',
    messages: []
};

let conversations = [];
let isLoading = false;

// DOM Elements
const composerInput = document.getElementById('composerInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const chatList = document.getElementById('chatList');
const newChatBtn = document.getElementById('newChatBtn');
const conversationTitle = document.getElementById('conversationTitle');
const conversationSubtitle = document.getElementById('conversationSubtitle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeStarField();
    loadConversations();
    setupEventListeners();
    autoResizeTextarea();
});

// Star Field Generation
function initializeStarField() {
    const starField = document.querySelector('.star-field');
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${3 + Math.random() * 3}s`;
        
        starField.appendChild(star);
    }
}

// Event Listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    
    composerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    composerInput.addEventListener('input', autoResizeTextarea);
    
    newChatBtn.addEventListener('click', createNewConversation);
}

// Auto-resize textarea
function autoResizeTextarea() {
    composerInput.style.height = 'auto';
    composerInput.style.height = Math.min(composerInput.scrollHeight, 120) + 'px';
}

// Send Message
async function sendMessage() {
    const message = composerInput.value.trim();
    
    if (!message || isLoading) return;
    
    // Clear input
    composerInput.value = '';
    composerInput.style.height = 'auto';
    
    // Add user message to conversation
    addMessageToConversation('user', message);
    
    // Update conversation title if it's the first message
    if (currentConversation.messages.length === 1) {
        currentConversation.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        updateConversationHeader();
        saveConversations();
    }
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
        // Send to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: currentConversation.id,
                messages: currentConversation.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        
        // Remove loading indicator
        hideLoadingIndicator();
        
        // Add AI response to conversation
        addMessageToConversation('assistant', data.message);
        
        // Save conversation
        saveConversations();
        
    } catch (error) {
        hideLoadingIndicator();
        showError('Something went wrong. Please try again.');
        console.error('Error:', error);
    }
}

// Add message to conversation
function addMessageToConversation(role, content) {
    const message = {
        role,
        content,
        timestamp: new Date().toISOString()
    };
    
    currentConversation.messages.push(message);
    
    // Render message
    renderMessage(message);
    
    // Scroll to bottom
    scrollToBottom();
    
    // Hide empty state
    emptyState.classList.add('hidden');
}

// Render message
function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = message.role === 'user' ? 'YOU' : 'CELCIA';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = parseMarkdown(message.content);
    
    messageDiv.appendChild(header);
    messageDiv.appendChild(content);
    
    // Add actions for AI messages
    if (message.role === 'assistant') {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        // Listen button
        const listenBtn = document.createElement('button');
        listenBtn.className = 'message-action';
        listenBtn.innerHTML = '◉ Listen';
        listenBtn.addEventListener('click', () => listenToResponse(message.content));
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action';
        copyBtn.innerHTML = 'Copy';
        copyBtn.addEventListener('click', () => copyToClipboard(message.content));
        
        // Regenerate button
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'message-action';
        regenerateBtn.innerHTML = '↻ Regenerate';
        regenerateBtn.addEventListener('click', () => regenerateResponse(message));
        
        actions.appendChild(listenBtn);
        actions.appendChild(copyBtn);
        actions.appendChild(regenerateBtn);
        
        messageDiv.appendChild(actions);
    }
    
    messagesContainer.appendChild(messageDiv);
}

// Parse Markdown (basic implementation)
function parseMarkdown(text) {
    // Escape HTML to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Unordered lists
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (!para.trim()) return '';
        if (para.startsWith('<')) return para;
        return `<p>${para}</p>`;
    }).join('');
    
    return html;
}

// Loading indicator
function showLoadingIndicator() {
    isLoading = true;
    sendBtn.disabled = true;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.innerHTML = `
        <span>CELCIA</span>
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    
    messagesContainer.appendChild(loadingDiv);
    scrollToBottom();
}

function hideLoadingIndicator() {
    isLoading = false;
    sendBtn.disabled = false;
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message';
    errorDiv.innerHTML = `
        <div class="message-header">ERROR</div>
        <div class="message-content" style="color: #ff6b6b;">${message}</div>
    `;
    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
}

// Scroll to bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        // Could add a subtle "Copied" feedback here
    } catch (error) {
        console.error('Failed to copy:', error);
    }
}

// Listen to response (ElevenLabs)
async function listenToResponse(text) {
    try {
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
    } catch (error) {
        console.error('Error generating audio:', error);
        showError('Failed to generate audio. Please try again.');
    }
}

// Regenerate response
async function regenerateResponse(message) {
    // Find the user message that prompted this response
    const messageIndex = currentConversation.messages.findIndex(m => m === message);
    if (messageIndex <= 0) return;
    
    const userMessage = currentConversation.messages[messageIndex - 1];
    
    // Remove the AI response
    currentConversation.messages = currentConversation.messages.slice(0, messageIndex);
    
    // Re-render messages
    messagesContainer.innerHTML = '';
    currentConversation.messages.forEach(msg => renderMessage(msg));
    
    // Send the user message again
    composerInput.value = userMessage.content;
    sendMessage();
}

// Conversation Management
function createNewConversation() {
    currentConversation = {
        id: Date.now().toString(),
        title: 'New conversation',
        messages: []
    };
    
    updateConversationHeader();
    renderMessages();
    updateChatList();
    saveConversations();
    
    composerInput.focus();
}

function updateConversationHeader() {
    conversationTitle.textContent = currentConversation.title;
    
    const messageCount = currentConversation.messages.length;
    if (messageCount > 0) {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        conversationSubtitle.textContent = `${today} · ${messageCount} messages`;
    } else {
        conversationSubtitle.textContent = 'Start a new chat';
    }
}

function renderMessages() {
    messagesContainer.innerHTML = '';
    
    if (currentConversation.messages.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        currentConversation.messages.forEach(msg => renderMessage(msg));
    }
}

// Chat History
function loadConversations() {
    const saved = localStorage.getItem('celcia_conversations');
    if (saved) {
        conversations = JSON.parse(saved);
        updateChatList();
        
        // Load the most recent conversation
        if (conversations.length > 0) {
            currentConversation = conversations[0];
            updateConversationHeader();
            renderMessages();
        }
    }
}

function saveConversations() {
    // Update or add current conversation
    const existingIndex = conversations.findIndex(c => c.id === currentConversation.id);
    if (existingIndex >= 0) {
        conversations[existingIndex] = currentConversation;
    } else {
        conversations.unshift(currentConversation);
    }
    
    // Keep only last 20 conversations
    conversations = conversations.slice(0, 20);
    
    localStorage.setItem('celcia_conversations', JSON.stringify(conversations));
    updateChatList();
}

function updateChatList() {
    chatList.innerHTML = '';
    
    conversations.forEach(conv => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${conv.id === currentConversation.id ? 'active' : ''}`;
        chatItem.textContent = conv.title;
        chatItem.addEventListener('click', () => loadConversation(conv.id));
        
        chatList.appendChild(chatItem);
    });
}

function loadConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        currentConversation = conversation;
        updateConversationHeader();
        renderMessages();
        updateChatList();
    }
}