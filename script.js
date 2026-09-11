// State Management
let currentConversation = {
    id: null,
    title: 'New conversation',
    messages: []
};

let conversations = [];
let isLoading = false;
let accessToken = localStorage.getItem('celcia_access_token');

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
    initializeCelciaBackground();
    loadConversations();
    setupEventListeners();
    autoResizeTextarea();
});

// Lightweight canvas flow field background
function initializeCelciaBackground() {
    const canvas = document.getElementById('celcia-background');
    if (!canvas || !canvas.getContext) return;

    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = [];
    const pointer = { x: 0, y: 0, active: false };
    const lightFields = [
        { x: 0.18, y: 0.25, radius: 0.7, color: 'rgba(72, 82, 130, 0.035)' },
        { x: 0.82, y: 0.72, radius: 0.6, color: 'rgba(95, 74, 130, 0.028)' }
    ];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = null;
    let lastTime = 0;

    function particleCount() {
        return Math.min(
            window.innerWidth < 768 ? 180 : 420,
            Math.max(100, Math.round(window.innerWidth * window.innerHeight / 3200))
        );
    }

    function resetParticles() {
        particles.length = 0;
        const count = particleCount();

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                size: 0.45 + Math.random() * 1.15,
                opacity: 0.16 + Math.random() * 0.34,
                drift: Math.random() * Math.PI * 2,
                tone: Math.random()
            });
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        resetParticles();
        drawBackground(0);
    }

    function drawBackground(time) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = '#020202';
        context.fillRect(0, 0, width, height);

        for (let i = 0; i < lightFields.length; i++) {
            const field = lightFields[i];
            const drift = time * (i === 0 ? 0.000035 : -0.000028);
            const x = (field.x + Math.sin(drift + i) * 0.07) * width;
            const y = (field.y + Math.cos(drift * 1.2 + i) * 0.06) * height;
            const gradient = context.createRadialGradient(x, y, 0, x, y, width * field.radius);
            gradient.addColorStop(0, field.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        }
    }

    function drawFrame(time) {
        const elapsed = lastTime ? Math.min(time - lastTime, 40) : 16;
        const step = elapsed * 0.045;
        const seconds = time * 0.001;
        lastTime = time;

        drawBackground(time);
        context.globalCompositeOperation = 'lighter';

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const nx = particle.x / width;
            const ny = particle.y / height;
            const wave = Math.sin(nx * 7 + seconds * 0.12 + particle.drift);
            const crossWave = Math.cos(ny * 6 - seconds * 0.1 + particle.drift);
            const angle = wave * 0.82 + crossWave * 0.46;
            const targetVx = Math.cos(angle) * 0.38;
            const targetVy = Math.sin(angle) * 0.38;

            particle.vx += (targetVx - particle.vx) * 0.025;
            particle.vy += (targetVy - particle.vy) * 0.025;

            if (pointer.active) {
                const dx = pointer.x - particle.x;
                const dy = pointer.y - particle.y;
                const distanceSquared = dx * dx + dy * dy;
                if (distanceSquared < 90000) {
                    const influence = (1 - distanceSquared / 90000) * 0.00035;
                    particle.vx += dx * influence;
                    particle.vy += dy * influence;
                }
            }

            particle.x += particle.vx * step;
            particle.y += particle.vy * step;

            if (particle.x < -4) particle.x = width + 4;
            if (particle.x > width + 4) particle.x = -4;
            if (particle.y < -4) particle.y = height + 4;
            if (particle.y > height + 4) particle.y = -4;

            context.globalAlpha = particle.opacity;
            context.fillStyle = particle.tone > 0.86 ? '#b8b9d8' : '#f1f1f4';
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        }

        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        if (!document.hidden) {
            animationFrame = requestAnimationFrame(drawFrame);
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = null;
            lastTime = 0;
        } else if (!reducedMotion && !animationFrame) {
            animationFrame = requestAnimationFrame(drawFrame);
        }
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
        pointer.active = false;
    }, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeCanvas();
    if (!reducedMotion) {
        animationFrame = requestAnimationFrame(drawFrame);
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
    document.getElementById('memoryBtn').addEventListener('click', openMemories);
    document.getElementById('closeMemoryBtn').addEventListener('click', () => document.getElementById('memoryPanel').classList.add('hidden'));
    document.getElementById('clearMemoryBtn').addEventListener('click', clearMemories);
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('authPanel').classList.toggle('hidden');
    });
    document.getElementById('logoutBtn').addEventListener('click', signOut);
    document.getElementById('authPanel').addEventListener('submit', signIn);
    updateSessionUI();
}

async function openMemories() {
    if (!accessToken) {
        document.getElementById('authPanel').classList.remove('hidden');
        return;
    }
    const panel = document.getElementById('memoryPanel');
    const list = document.getElementById('memoryList');
    panel.classList.remove('hidden');
    list.textContent = 'Loading...';
    const response = await fetch('/api/memories', { headers: authHeaders() });
    const memories = response.ok ? await response.json() : [];
    list.innerHTML = '';
    memories.forEach(memory => {
        const item = document.createElement('div');
        item.className = 'memory-item';
        const text = document.createElement('span');
        text.textContent = memory.content;
        const meta = document.createElement('small');
        meta.textContent = `${memory.category} · ${new Date(memory.updated_at || memory.created_at).toLocaleDateString()}`;
        item.appendChild(text);
        item.appendChild(meta);
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', async () => {
            const content = window.prompt('Update this memory', memory.content);
            if (content && content.trim() !== memory.content) {
                await fetch(`/api/memories/${memory.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({ content: content.trim(), category: memory.category, importance: memory.importance, confidence: memory.confidence })
                });
                openMemories();
            }
        });
        item.appendChild(editButton);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async () => {
            await fetch(`/api/memories/${memory.id}`, { method: 'DELETE', headers: authHeaders() });
            openMemories();
        });
        item.appendChild(deleteButton);
        list.appendChild(item);
    });
    if (!memories.length) list.textContent = 'No memories saved yet.';
}

async function clearMemories() {
    if (accessToken && window.confirm('Clear all saved memories?')) {
        await fetch('/api/memories', { method: 'DELETE', headers: authHeaders() });
        openMemories();
    }
}

function authHeaders() {
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
}

function updateSessionUI() {
    const signedIn = Boolean(accessToken);
    document.getElementById('sessionStatus').textContent = signedIn ? 'Private session' : 'Sign in required';
    document.getElementById('loginBtn').classList.toggle('hidden', signedIn);
    document.getElementById('logoutBtn').classList.toggle('hidden', !signedIn);
    // Keep the composer focusable so visitors can type before signing in.
    // Sending still requires a private Supabase session.
    composerInput.disabled = false;
    composerInput.placeholder = signedIn ? 'Ask Celcia anything...' : 'Sign in to chat with Celcia...';
    sendBtn.disabled = false;
}

async function signIn(event) {
    event.preventDefault();
    const error = document.getElementById('authError');
    error.textContent = '';
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: document.getElementById('authEmail').value, password: document.getElementById('authPassword').value })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail?.message || data.message || 'Sign in failed.');
        accessToken = data.access_token;
        localStorage.setItem('celcia_access_token', accessToken);
        document.getElementById('authPanel').classList.add('hidden');
        updateSessionUI();
        await loadConversations();
    } catch (e) {
        error.textContent = e.message;
    }
}

function signOut() {
    accessToken = null;
    localStorage.removeItem('celcia_access_token');
    conversations = [];
    currentConversation = { id: null, title: 'New conversation', messages: [] };
    renderMessages();
    updateChatList();
    updateSessionUI();
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

    if (!accessToken) {
        document.getElementById('authPanel').classList.remove('hidden');
        showError('Sign in to start a private conversation.');
        return;
    }
    
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
                'Content-Type': 'application/json',
                ...authHeaders()
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
        currentConversation.id = data.conversation_id;
        
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
            // Try to parse error response
            let errorMessage = 'Voice playback is currently unavailable.';
            
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // If error response is not JSON, use status-based message
                if (response.status === 404) {
                    errorMessage = 'The configured voice is not available. Please check your ElevenLabs voice configuration.';
                } else if (response.status === 401) {
                    errorMessage = 'Invalid ElevenLabs API key. Please check your configuration.';
                } else if (response.status === 402) {
                    errorMessage = 'The selected voice may require payment. Try a different voice or check your ElevenLabs account.';
                } else {
                    errorMessage = 'Voice playback is currently unavailable. Please try again later.';
                }
            }
            
            showError(errorMessage);
            return;
        }
        
        // Handle audio response - serverless returns bytes directly
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        // Clean up the object URL after audio finishes playing
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
        });
        
    } catch (error) {
        console.error('Error generating audio:', error);
        showError('Voice playback is currently unavailable. Please check your connection and try again.');
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
        id: null,
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
async function loadConversations() {
    if (!accessToken) return;
    try {
        const response = await fetch('/api/conversations', { headers: authHeaders() });
        if (!response.ok) return;
        conversations = await response.json();
        updateChatList();
        if (conversations.length > 0) {
            currentConversation = conversations[0];
            const messagesResponse = await fetch(`/api/conversations/${currentConversation.id}/messages`, { headers: authHeaders() });
            currentConversation.messages = messagesResponse.ok ? await messagesResponse.json() : [];
            updateConversationHeader();
            renderMessages();
        }
    } catch (error) {
        console.error('Unable to load private conversations:', error);
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