(function () {
    "use strict";

    // ============ DOM Elements ============
    const $ = (id) => document.getElementById(id);
    const root = document.documentElement;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const metaTheme = $('metaTheme');
    const favicon = $('favicon');
    const skyCanvas = $('sky');
    const sidebar = $('sidebar');
    const backdrop = $('backdrop');
    const menuBtn = $('menuBtn');
    const newChatBtn = $('newChatBtn');
    const chatList = $('chatList');
    const memoryBtn = $('memoryBtn');
    const memoryPop = $('memoryPop');
    const memList = $('memList');
    const memClear = $('memClear');
    const accountBlock = $('accountBlock');
    const avatarEl = $('avatarEl');
    const acctName = $('acctName');
    const acctMail = $('acctMail');
    const signOutSide = $('signOutSide');
    const headMoon = $('headMoon');
    const bigMoon = $('bigMoon');
    const headTitle = $('headTitle');
    const phaseName = $('phaseName');
    const themeToggle = $('themeToggle');
    const clockEl = $('clock');
    const voiceSwitch = $('voiceSwitch');
    const authBtn = $('authBtn');
    const authPop = $('authPop');
    const authForm = $('authForm');
    const authEmail = $('authEmail');
    const authPassword = $('authPassword');
    const authErr = $('authErr');
    const scroll = $('scroll');
    const emptyState = $('emptyState');
    const emptyCopy = $('emptyCopy');
    const entries = $('entries');
    const attachRow = $('attachRow');
    const statusRow = $('statusRow');
    const fileInput = $('fileInput');
    const attachBtn = $('attachBtn');
    const input = $('input');
    const micBtn = $('micBtn');
    const sendBtn = $('sendBtn');
    const toastDock = $('toastDock');

    // ============ Application State ============
    let accessToken = localStorage.getItem('celcia_access_token');
    let sessionUser = null;
    let conversations = [];
    let currentConversation = {
        id: null,
        title: 'Untitled page',
        messages: []
    };
    let attachedFiles = [];
    let isSending = false;
    let currentAudio = null;
    let autoVoiceEnabled = localStorage.getItem('celcia_auto_voice') === 'true';
    let recognition = null;
    let isRecording = false;

    // ============ Utility Functions ============
    function now() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function el(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function toast(msg) {
        if (!toastDock) return;
        const t = el('div', 'toast', msg);
        toastDock.appendChild(t);
        setTimeout(() => {
            t.classList.add('bye');
            setTimeout(() => t.remove(), 320);
        }, 2500);
    }

    function nearBottom() {
        if (!scroll) return true;
        return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 140;
    }

    function pin() {
        if (!scroll) return;
        scroll.scrollTop = scroll.scrollHeight;
    }

    function dayLabel(ts) {
        if (!ts) return 'Today';
        const d = new Date(ts);
        const t = new Date();
        const dayMs = 86400000;
        const todayZero = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
        const itemTs = d.getTime();
        if (itemTs >= todayZero) return 'Today';
        if (itemTs >= todayZero - dayMs) return 'Yest.';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function initials(name) {
        if (!name) return 'C';
        return name
            .split(/[\s._-]+/)
            .slice(0, 2)
            .map((p) => p[0] || '')
            .join('')
            .toUpperCase() || 'C';
    }

    function authHeaders() {
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    }

    // ============ Moon Phase System ============
    const SYNODIC = 29.53058867;
    const EPOCH = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

    function moonPhase(d) {
        const days = d.getTime() / 86400000 - EPOCH;
        const p = (days % SYNODIC) / SYNODIC;
        return p < 0 ? p + 1 : p;
    }

    function getPhaseName(p) {
        if (p < 0.03 || p > 0.97) return 'New moon';
        if (p < 0.22) return 'Waxing crescent';
        if (p < 0.28) return 'First quarter';
        if (p < 0.47) return 'Waxing gibbous';
        if (p < 0.53) return 'Full moon';
        if (p < 0.72) return 'Waning gibbous';
        if (p < 0.78) return 'Last quarter';
        return 'Waning crescent';
    }

    function drawMoon(cv, size) {
        if (!cv) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = size * dpr;
        cv.height = size * dpr;
        cv.style.width = size + 'px';
        cv.style.height = size + 'px';
        const ctx = cv.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const dark = root.getAttribute('data-theme') === 'dark';
        const c = size / 2, r = c - 1;
        const p = moonPhase(new Date());

        // Night side
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.fillStyle = dark ? '#222D26' : '#E2E0D2';
        ctx.fill();

        // Lit side
        const e = Math.cos(p * 2 * Math.PI);
        const ccw = e > 0;
        const waxing = p < 0.5;

        ctx.beginPath();
        if (waxing) {
            ctx.arc(c, c, r, -Math.PI / 2, Math.PI / 2, false);
            ctx.ellipse(c, c, Math.abs(e) * r, r, 0, Math.PI / 2, -Math.PI / 2, ccw);
        } else {
            ctx.arc(c, c, r, Math.PI / 2, -Math.PI / 2, false);
            ctx.ellipse(c, c, Math.abs(e) * r, r, 0, -Math.PI / 2, Math.PI / 2, ccw);
        }
        ctx.closePath();
        ctx.fillStyle = dark ? '#EAE7D8' : '#F2EDDA';
        ctx.fill();

        // Rim stroke
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.strokeStyle = dark ? 'rgba(234,231,216,.28)' : 'rgba(33,42,36,.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const currentMoonPhase = moonPhase(new Date());
    const currentPhaseText = getPhaseName(currentMoonPhase);
    if (phaseName) phaseName.textContent = currentPhaseText;

    if (emptyCopy) {
        const h = new Date().getHours();
        const timeOfDay = h < 12 ? 'this morning' : h < 18 ? 'this afternoon' : 'tonight';
        emptyCopy.innerHTML = `The moon above you is a <em>${currentPhaseText.toLowerCase()}</em> ${timeOfDay}. Ask in your own words — Celcia answers plainly and keeps the pages in order.`;
    }

    // ============ Celestial Sky Canvas ============
    (function initSky() {
        if (!skyCanvas) return;
        const ctx = skyCanvas.getContext('2d');
        if (!ctx) return;

        let stars = [], meteors = [], W = 0, H = 0;
        const PAL_LIGHT = ['58,74,62', '46,122,95', '158,124,52'];
        const PAL_DARK = ['234,231,216', '155,216,187', '216,180,104'];

        function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            skyCanvas.width = W * dpr;
            skyCanvas.height = H * dpr;
            skyCanvas.style.width = W + 'px';
            skyCanvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            makeStars();
        }

        function makeStars() {
            stars = [];
            const n = Math.round((W * H) / 8500);
            for (let i = 0; i < n; i++) {
                const roll = Math.random();
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: 0.4 + Math.random() * 1.1,
                    tw: Math.random() * Math.PI * 2,
                    sp: 0.4 + Math.random() * 0.9,
                    tint: roll < 0.85 ? 0 : roll < 0.95 ? 1 : 2
                });
            }
        }

        function frame(t) {
            const dark = root.getAttribute('data-theme') === 'dark';
            const pal = dark ? PAL_DARK : PAL_LIGHT;
            const base = dark ? 0.22 : 0.16;
            const span = dark ? 0.5 : 0.34;
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const a = reduceMotion
                    ? (dark ? 0.55 : 0.4)
                    : base + span * (0.5 + 0.5 * Math.sin(s.tw + t * 0.001 * s.sp));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${pal[s.tint]},${a.toFixed(3)})`;
                ctx.fill();
            }

            if (!reduceMotion) {
                if (Math.random() < 0.0022 && meteors.length < 2) {
                    meteors.push({
                        x: W * (0.3 + Math.random() * 0.7),
                        y: H * Math.random() * 0.35,
                        vx: -(5 + Math.random() * 4),
                        vy: 2.4 + Math.random() * 1.8,
                        life: 1
                    });
                }
                const trail = dark ? '234,231,216' : '58,74,62';
                for (let m = meteors.length - 1; m >= 0; m--) {
                    const M = meteors[m];
                    const grad = ctx.createLinearGradient(M.x, M.y, M.x - M.vx * 9, M.y - M.vy * 9);
                    grad.addColorStop(0, `rgba(${trail},${0.8 * M.life})`);
                    grad.addColorStop(1, `rgba(${trail},0)`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(M.x, M.y);
                    ctx.lineTo(M.x - M.vx * 9, M.y - M.vy * 9);
                    ctx.stroke();
                    M.x += M.vx;
                    M.y += M.vy;
                    M.life -= 0.022;
                    if (M.life <= 0 || M.x < -60 || M.y > H + 60) meteors.splice(m, 1);
                }
            }
            requestAnimationFrame(frame);
        }

        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(frame);
    })();

    // ============ Theme & Eclipse Wipe ============
    const FAVICONS = {
        light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23F3F2EA'/%3E%3Cellipse cx='32' cy='32' rx='26' ry='10' transform='rotate(-22 32 32)' fill='none' stroke='%232E7A5F' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='7' fill='%23212A24'/%3E%3C/svg%3E",
        dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230D1310'/%3E%3Cellipse cx='32' cy='32' rx='26' ry='10' transform='rotate(-22 32 32)' fill='none' stroke='%238FD6B0' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='7' fill='%23E7EDE6'/%3E%3C/svg%3E"
    };
    const METAS = { light: '#F3F2EA', dark: '#0D1310' };

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function setTheme(t) {
        root.setAttribute('data-theme', t);
        if (favicon) favicon.setAttribute('href', FAVICONS[t]);
        if (metaTheme) metaTheme.setAttribute('content', METAS[t]);
        if (themeToggle) themeToggle.setAttribute('aria-label', t === 'dark' ? 'Switch to day' : 'Switch to night');
        try { localStorage.setItem('celcia-theme', t); } catch (_) {}
        drawMoon(headMoon, 20);
        drawMoon(bigMoon, 56);
    }

    setTheme(currentTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            if (document.startViewTransition && !reduceMotion) {
                const r = this.getBoundingClientRect();
                const x = r.left + r.width / 2, y = r.top + r.height / 2;
                const vt = document.startViewTransition(() => setTheme(next));
                vt.ready.then(() => {
                    const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0px at ${x}px ${y}px)`,
                                `circle(${rad}px at ${x}px ${y}px)`
                            ]
                        },
                        {
                            duration: 700,
                            easing: 'cubic-bezier(.4, 0, .2, 1)',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    );
                }).catch(() => {});
            } else {
                root.classList.add('theme-anim');
                setTheme(next);
                setTimeout(() => root.classList.remove('theme-anim'), 500);
            }
        });
    }

    // ============ Real-time Clock ============
    function tick() {
        if (clockEl) {
            clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    tick();
    setInterval(tick, 5000);

    // ============ Sidebar Drawer (Mobile) ============
    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('show');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        });
    }
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // ============ Header Context Sync ============
    function syncHeader() {
        if (!headTitle) return;
        if (currentConversation && currentConversation.messages && currentConversation.messages.length) {
            headTitle.textContent = currentConversation.title || 'Untitled page';
        } else {
            headTitle.textContent = 'Celcia';
        }
    }

    // ============ Markdown Parser ============
    function parseMarkdown(text) {
        if (!text) return '';
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Fenced code blocks
        html = html.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_m, _lang, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Blockquotes
        html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

        // Unordered lists
        html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        // Paragraphs
        html = html
            .split('\n\n')
            .map((para) => {
                const trimmed = para.trim();
                if (!trimmed) return '';
                if (
                    trimmed.startsWith('<pre>') ||
                    trimmed.startsWith('<ul>') ||
                    trimmed.startsWith('<ol>') ||
                    trimmed.startsWith('<blockquote>')
                ) {
                    return trimmed;
                }
                return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            })
            .join('');

        return html;
    }

    // ============ Message Rendering ============
    const MINI_MARK = `
        <svg class="mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <ellipse cx="24" cy="24" rx="20" ry="7.5" transform="rotate(-22 24 24)" stroke="currentColor" stroke-width="2.4" opacity=".45"/>
            <circle cx="24" cy="24" r="6" fill="currentColor"/>
            <g transform="translate(24 24) rotate(-22) scale(1 0.38) translate(-24 -24)">
                <circle cx="24" cy="4" r="3.4" fill="currentColor"/>
            </g>
        </svg>
    `;

    function buildMessageNode(msg) {
        const art = el('article', 'msg ' + msg.role);
        const head = el('header', 'msg-head');
        const name = el('span', 'msg-name');

        if (msg.role === 'assistant') {
            name.innerHTML = MINI_MARK;
            name.appendChild(document.createTextNode('Celcia'));
        } else {
            name.textContent = 'You';
        }
        head.appendChild(name);

        const timeStr = msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : now());
        head.appendChild(el('time', 'msg-time', timeStr));
        art.appendChild(head);

        const body = el('div', 'msg-body');
        if (msg.role === 'assistant') {
            body.innerHTML = parseMarkdown(msg.content || msg.text || '');
        } else {
            body.textContent = msg.content || msg.text || '';
        }
        art.appendChild(body);

        if (msg.files && msg.files.length) {
            const row = el('div', 'msg-files');
            msg.files.forEach((f) => row.appendChild(el('span', 'file-chip', typeof f === 'string' ? f : f.name)));
            art.appendChild(row);
        }

        // Tools / Actions
        const tools = el('footer', 'msg-tools');

        const copyBtn = el('button', 'tool');
        copyBtn.type = 'button';
        copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="1.8"/></svg> Copy';
        copyBtn.addEventListener('click', () => {
            const raw = msg.content || msg.text || '';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(raw).then(() => toast('Copied'));
            } else {
                const ta = document.createElement('textarea');
                ta.value = raw;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                toast('Copied');
            }
        });
        tools.appendChild(copyBtn);

        if (msg.role === 'assistant') {
            const listenBtn = el('button', 'tool');
            listenBtn.type = 'button';
            listenBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/></svg> Listen';
            listenBtn.addEventListener('click', () => {
                listenToResponse(msg.content || msg.text || '');
            });
            tools.appendChild(listenBtn);
        }

        art.appendChild(tools);
        return art;
    }

    function showThinking() {
        const art = el('article', 'msg assistant thinking');
        const head = el('header', 'msg-head');
        const name = el('span', 'msg-name');
        name.innerHTML = MINI_MARK;
        name.appendChild(document.createTextNode('Celcia'));
        head.appendChild(name);
        head.appendChild(el('time', 'msg-time', now()));
        art.appendChild(head);

        const line = el('div', 'thinking-line');
        line.appendChild(el('span', 't-dot'));
        line.appendChild(el('span', 't-dot'));
        line.appendChild(el('span', 't-dot'));
        art.appendChild(line);

        if (scroll) {
            scroll.appendChild(art);
            pin();
        }
        return art;
    }

    function renderThread() {
        if (!scroll) return;
        scroll.innerHTML = '';
        if (!currentConversation || !currentConversation.messages || !currentConversation.messages.length) {
            if (emptyState) scroll.appendChild(emptyState);
            drawMoon(bigMoon, 56);
            return;
        }

        currentConversation.messages.forEach((m, i) => {
            if (m.role === 'user' && i > 0) {
                const b = el('div', 'break');
                b.appendChild(el('i'));
                scroll.appendChild(b);
            }
            const node = buildMessageNode(m);
            node.style.animation = 'none';
            scroll.appendChild(node);
        });
        pin();
    }

    // ============ Sidebar Pages ============
    const X_SVG = '<svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    function renderSidebar() {
        if (!chatList) return;
        chatList.innerHTML = '';

        if (!conversations.length) {
            chatList.appendChild(el('p', 'list-empty', 'No pages yet — the book is blank.'));
            return;
        }

        conversations.forEach((c) => {
            const isActive = c.id === currentConversation.id;
            const item = el('div', 'pg' + (isActive ? ' active' : ''));
            item.setAttribute('role', 'button');
            item.tabIndex = 0;

            item.appendChild(el('span', 'pg-title', c.title || 'Untitled page'));
            item.appendChild(el('i', 'pg-lead'));
            item.appendChild(el('span', 'pg-day', dayLabel(c.updated_at || c.created_at || c.ts)));

            const del = el('button', 'pg-x');
            del.type = 'button';
            del.setAttribute('aria-label', 'Tear out this page');
            del.innerHTML = X_SVG;
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                conversations = conversations.filter((x) => x.id !== c.id);
                if (currentConversation.id === c.id) {
                    startNewConversation();
                } else {
                    renderSidebar();
                }
                toast('Page removed from view');
            });
            item.appendChild(del);

            function pick() {
                loadConversation(c.id);
                closeSidebar();
                if (input) input.focus();
            }

            item.addEventListener('click', pick);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pick();
                }
            });

            chatList.appendChild(item);
        });
    }

    // ============ Conversations Backend API ============
    async function loadConversations() {
        if (!accessToken) {
            renderSidebar();
            return;
        }
        try {
            const res = await fetch('/api/conversations', { headers: authHeaders() });
            if (!res.ok) return;
            conversations = await res.json();
            renderSidebar();
            if (conversations.length > 0 && !currentConversation.id) {
                loadConversation(conversations[0].id);
            }
        } catch (err) {
            console.error('Unable to load conversations:', err);
        }
    }

    async function loadConversation(id) {
        const found = conversations.find((c) => c.id === id);
        currentConversation.id = id;
        currentConversation.title = found ? found.title : 'Untitled page';
        syncHeader();
        renderSidebar();

        if (scroll) scroll.innerHTML = '';
        const thinker = showThinking();

        try {
            const res = await fetch(`/api/conversations/${id}/messages`, { headers: authHeaders() });
            thinker.remove();
            if (res.ok) {
                currentConversation.messages = await res.json();
            } else {
                currentConversation.messages = [];
            }
            renderThread();
            syncHeader();
        } catch (err) {
            thinker.remove();
            console.error('Failed to load conversation messages:', err);
            renderThread();
        }
    }

    function startNewConversation() {
        currentConversation = {
            id: null,
            title: 'Untitled page',
            messages: []
        };
        syncHeader();
        renderSidebar();
        renderThread();
        closeSidebar();
        if (input) input.focus();
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            if (currentConversation && currentConversation.messages && currentConversation.messages.length === 0) {
                if (input) input.focus();
                return;
            }
            startNewConversation();
        });
    }

    // ============ Attachments ============
    function fmtSize(b) {
        return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
    }

    function renderAttachments() {
        if (!attachRow) return;
        attachRow.innerHTML = '';
        if (!attachedFiles.length) {
            attachRow.classList.add('hidden');
            return;
        }
        attachRow.classList.remove('hidden');
        attachedFiles.forEach((f, i) => {
            const chip = el('div', 'attach-chip');
            chip.appendChild(el('span', null, f.name));
            chip.appendChild(el('span', 'sz', fmtSize(f.size)));
            const x = el('button');
            x.type = 'button';
            x.setAttribute('aria-label', 'Remove ' + f.name);
            x.innerHTML = X_SVG;
            x.addEventListener('click', () => {
                attachedFiles.splice(i, 1);
                renderAttachments();
                updateSendState();
            });
            chip.appendChild(x);
            attachRow.appendChild(chip);
        });
    }

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (!fileInput.files) return;
            Array.prototype.forEach.call(fileInput.files, (f) => {
                if (f.size > 8 * 1024 * 1024) {
                    toast(`${f.name} is too large. Limit is 8 MB.`);
                } else {
                    attachedFiles.push(f);
                }
            });
            renderAttachments();
            fileInput.value = '';
            updateSendState();
        });
    }

    // ============ Composer ============
    function updateSendState() {
        if (!sendBtn || !input) return;
        const ready = input.value.trim().length > 0 || attachedFiles.length > 0;
        sendBtn.classList.toggle('ready', ready);
        sendBtn.disabled = !ready || isSending;
    }

    if (input) {
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 160) + 'px';
            updateSendState();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== input) {
            const t = e.target.tagName;
            if (t !== 'INPUT' && t !== 'TEXTAREA') {
                e.preventDefault();
                if (input) input.focus();
            }
        }
        if (e.key === 'Escape') {
            if (authPop) authPop.classList.add('hidden');
            if (memoryPop) memoryPop.classList.add('hidden');
            if (memoryBtn) {
                memoryBtn.classList.remove('on');
                memoryBtn.setAttribute('aria-pressed', 'false');
            }
            closeSidebar();
        }
    });

    // ============ Starter Prompt Entries ============
    if (entries) {
        entries.addEventListener('click', (e) => {
            const btn = e.target.closest('.entry');
            if (!btn || !input) return;
            const textSpan = btn.querySelector('span');
            if (textSpan) {
                input.value = textSpan.textContent.trim();
                input.dispatchEvent(new Event('input'));
                input.focus();
            }
        });
    }

    // ============ Send Message & AI Chat Completion ============
    async function sendMessage() {
        if (isSending || !input) return;
        const text = input.value.trim();
        if (!text && !attachedFiles.length) return;

        if (!accessToken) {
            if (authPop) authPop.classList.remove('hidden');
            toast('Sign in to start a private conversation with Celcia.');
            return;
        }

        isSending = true;
        updateSendState();

        const sendingFiles = [...attachedFiles];
        const filesNames = sendingFiles.map((f) => f.name);

        // Upload attachments first
        let documentIds = [];
        if (sendingFiles.length) {
            if (statusRow) statusRow.textContent = 'Uploading attachments…';
            try {
                for (const file of sendingFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    if (currentConversation.id) formData.append('conversation_id', currentConversation.id);
                    const uploadRes = await fetch('/api/documents/upload', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: formData
                    });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok) {
                        throw new Error(uploadData.detail?.message || uploadData.message || `Failed to extract ${file.name}`);
                    }
                    documentIds.push(uploadData.id);
                }
            } catch (uploadErr) {
                if (statusRow) statusRow.textContent = '';
                toast(uploadErr.message || 'Could not upload attachment');
                isSending = false;
                updateSendState();
                return;
            }
            if (statusRow) statusRow.textContent = '';
        }

        // Clear composer
        input.value = '';
        input.style.height = 'auto';
        attachedFiles = [];
        renderAttachments();
        updateSendState();

        // Add user message to conversation
        const userMsg = {
            role: 'user',
            content: text || `Please review the attached: ${filesNames.join(', ')}`,
            files: filesNames,
            time: now()
        };

        const isNew = !currentConversation.messages || currentConversation.messages.length === 0;
        if (isNew) {
            currentConversation.title = text ? (text.length > 38 ? text.slice(0, 38).trim() + '…' : text) : filesNames[0] || 'Untitled page';
            syncHeader();
        }

        if (!currentConversation.messages) currentConversation.messages = [];
        currentConversation.messages.push(userMsg);

        if (isNew) {
            renderThread();
        } else {
            if (scroll && scroll.contains(emptyState)) {
                scroll.innerHTML = '';
            } else if (scroll && scroll.children.length) {
                const b = el('div', 'break');
                b.appendChild(el('i'));
                scroll.appendChild(b);
            }
            if (scroll) scroll.appendChild(buildMessageNode(userMsg));
        }
        pin();

        // Show thinking indicator
        const thinker = showThinking();

        try {
            const chatRes = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({
                    conversation_id: currentConversation.id,
                    document_ids: documentIds,
                    messages: currentConversation.messages.map((m) => ({
                        role: m.role,
                        content: m.content || m.text || ''
                    }))
                })
            });

            thinker.remove();

            if (!chatRes.ok) {
                const errData = await chatRes.json().catch(() => ({}));
                throw new Error(errData.detail?.message || errData.message || 'Celcia could not answer.');
            }

            const chatData = await chatRes.json();
            currentConversation.id = chatData.conversation_id;

            const assistantMsg = {
                role: 'assistant',
                content: chatData.message,
                time: now()
            };

            currentConversation.messages.push(assistantMsg);
            if (scroll) scroll.appendChild(buildMessageNode(assistantMsg));
            pin();

            loadConversations();
            syncHeader();

            if (autoVoiceEnabled) {
                listenToResponse(chatData.message, { automatic: true });
            }
        } catch (chatError) {
            thinker.remove();
            console.error('Chat error:', chatError);
            toast(chatError.message || 'Something went wrong. Please try again.');
        } finally {
            isSending = false;
            updateSendState();
        }
    }

    // ============ Voice Dictation ============
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (!SpeechRec) {
                toast('Voice input is not available in this browser');
                return;
            }
            if (isRecording) {
                recognition?.stop();
                return;
            }

            recognition = new SpeechRec();
            recognition.lang = navigator.language || 'en-US';
            recognition.interimResults = true;
            recognition.continuous = false;

            const baseText = input.value ? input.value + ' ' : '';

            recognition.onstart = () => {
                isRecording = true;
                micBtn.classList.add('rec');
                micBtn.setAttribute('aria-pressed', 'true');
                if (statusRow) {
                    statusRow.classList.add('rec');
                    statusRow.innerHTML = '<span class="rec-dot"></span>Listening…';
                }
            };

            recognition.onresult = (e) => {
                let transcript = '';
                for (let i = 0; i < e.results.length; i++) {
                    transcript += e.results[i][0].transcript;
                }
                if (input) {
                    input.value = baseText + transcript;
                    input.dispatchEvent(new Event('input'));
                }
            };

            recognition.onerror = (e) => {
                if (e.error !== 'aborted') {
                    toast('Microphone error: ' + (e.error || 'unavailable'));
                }
            };

            recognition.onend = () => {
                isRecording = false;
                micBtn.classList.remove('rec');
                micBtn.setAttribute('aria-pressed', 'false');
                if (statusRow) {
                    statusRow.classList.remove('rec');
                    statusRow.innerHTML = '';
                }
            };

            try {
                recognition.start();
            } catch (_) {
                toast('Voice dictation could not start');
            }
        });
    }

    // ============ ElevenLabs TTS Voice Playback ============
    function spokenText(text) {
        return text
            .replace(/```[\s\S]*?```/g, ' Code example omitted. ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/[*_#>-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        if (statusRow) statusRow.textContent = '';
    }

    async function listenToResponse(text, { automatic = false } = {}) {
        if (!text) return;
        stopAudio();

        if (!accessToken) {
            toast('Sign in to listen to Celcia’s voice.');
            return;
        }

        if (statusRow) statusRow.textContent = 'Preparing voice…';

        try {
            const res = await fetch('/api/voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({ text: spokenText(text) })
            });

            if (!res.ok) {
                if (statusRow) statusRow.textContent = '';
                if (!automatic) toast('Voice playback is unavailable right now.');
                return;
            }

            const audioBlob = await res.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            currentAudio = audio;

            if (statusRow) statusRow.textContent = 'Celcia is speaking…';

            audio.addEventListener('ended', () => {
                URL.revokeObjectURL(audioUrl);
                if (currentAudio === audio) currentAudio = null;
                if (statusRow) statusRow.textContent = '';
            });

            audio.addEventListener('error', () => {
                URL.revokeObjectURL(audioUrl);
                if (currentAudio === audio) currentAudio = null;
                if (statusRow) statusRow.textContent = '';
            });

            await audio.play();
        } catch (err) {
            console.error('Audio playback error:', err);
            if (statusRow) statusRow.textContent = '';
            if (!automatic) toast('Voice playback failed.');
        }
    }

    // ============ Read Aloud Switch ============
    if (voiceSwitch) {
        voiceSwitch.setAttribute('aria-checked', String(autoVoiceEnabled));
        voiceSwitch.addEventListener('click', function () {
            autoVoiceEnabled = this.getAttribute('aria-checked') !== 'true';
            this.setAttribute('aria-checked', String(autoVoiceEnabled));
            localStorage.setItem('celcia_auto_voice', String(autoVoiceEnabled));
            if (!autoVoiceEnabled) stopAudio();
        });
    }

    // ============ Authentication & Session ============
    function applySession() {
        if (sessionUser) {
            if (authBtn) authBtn.textContent = 'Account';
            if (accountBlock) accountBlock.classList.remove('hidden');
            const name = sessionUser.name || sessionUser.email?.split('@')[0] || 'User';
            if (avatarEl) avatarEl.textContent = initials(name);
            if (acctName) acctName.textContent = name;
            if (acctMail) acctMail.textContent = sessionUser.email || '';
        } else {
            if (authBtn) authBtn.textContent = 'Sign in';
            if (accountBlock) accountBlock.classList.add('hidden');
        }
    }

    async function checkSession() {
        if (!accessToken) {
            applySession();
            return;
        }
        try {
            const res = await fetch('/api/auth/session', { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                sessionUser = data.user || { email: 'user@celcia.ai' };
                sessionUser.name = sessionUser.email ? sessionUser.email.split('@')[0] : 'User';
                applySession();
                loadConversations();
            } else {
                signOut(false);
            }
        } catch (_) {
            applySession();
        }
    }

    function signOut(notify = true) {
        accessToken = null;
        sessionUser = null;
        localStorage.removeItem('celcia_access_token');
        conversations = [];
        currentConversation = { id: null, title: 'Untitled page', messages: [] };
        applySession();
        renderSidebar();
        renderThread();
        syncHeader();
        if (notify) toast('Signed out — the book stays put');
    }

    if (authBtn && authPop) {
        authBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sessionUser) {
                signOut(true);
                return;
            }
            authPop.classList.toggle('hidden');
            if (!authPop.classList.contains('hidden') && authEmail) {
                authEmail.focus();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (
            authPop &&
            !authPop.classList.contains('hidden') &&
            !authPop.contains(e.target) &&
            authBtn &&
            !authBtn.contains(e.target)
        ) {
            authPop.classList.add('hidden');
        }
    });

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = authEmail ? authEmail.value.trim() : '';
            const password = authPassword ? authPassword.value : '';

            if (!/^\S+@\S+\.\S+$/.test(email)) {
                if (authErr) authErr.textContent = 'That email does not look right — check it once more.';
                return;
            }
            if (password.length < 4) {
                if (authErr) authErr.textContent = 'At least four characters for the password, please.';
                return;
            }
            if (authErr) authErr.textContent = '';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail?.message || data.message || 'Sign in failed.');
                }

                accessToken = data.access_token;
                localStorage.setItem('celcia_access_token', accessToken);

                sessionUser = data.user || { email };
                sessionUser.name = email.split('@')[0];

                applySession();
                if (authPop) authPop.classList.add('hidden');
                if (authPassword) authPassword.value = '';
                toast('Signed the book as ' + sessionUser.name);

                loadConversations();
            } catch (err) {
                if (authErr) authErr.textContent = err.message;
            }
        });
    }

    if (signOutSide) {
        signOutSide.addEventListener('click', () => signOut(true));
    }

    // ============ The Ledger (Memories API) ============
    async function loadMemories() {
        if (!memList) return;
        memList.innerHTML = '<p class="list-empty">Reading the ledger…</p>';

        if (!accessToken) {
            memList.innerHTML = '<p class="list-empty">Sign in to view what Celcia remembers.</p>';
            return;
        }

        try {
            const res = await fetch('/api/memories', { headers: authHeaders() });
            if (!res.ok) {
                memList.innerHTML = '<p class="list-empty">Ledger is unavailable right now.</p>';
                return;
            }
            const memories = await res.json();
            memList.innerHTML = '';
            if (!memories.length) {
                memList.appendChild(el('p', 'list-empty', 'Nothing kept yet — it comes with conversation.'));
                return;
            }

            memories.forEach((m, i) => {
                const row = el('div', 'ledger-item');
                row.style.animationDelay = i * 40 + 'ms';

                const textSpan = el('span', null, m.content);
                const tag = el('small', null, dayLabel(m.updated_at || m.created_at));

                const actions = el('div', 'ledger-actions');

                const editBtn = el('button', 'ledger-action-btn', 'Edit');
                editBtn.type = 'button';
                editBtn.addEventListener('click', async () => {
                    const updated = window.prompt('Update this memory in the ledger:', m.content);
                    if (updated && updated.trim() !== m.content) {
                        await fetch(`/api/memories/${m.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', ...authHeaders() },
                            body: JSON.stringify({
                                content: updated.trim(),
                                category: m.category || 'context',
                                importance: m.importance || 0.5,
                                confidence: m.confidence || 0.5
                            })
                        });
                        loadMemories();
                    }
                });

                const delBtn = el('button', 'ledger-action-btn', 'Delete');
                delBtn.type = 'button';
                delBtn.addEventListener('click', async () => {
                    await fetch(`/api/memories/${m.id}`, {
                        method: 'DELETE',
                        headers: authHeaders()
                    });
                    loadMemories();
                });

                actions.appendChild(editBtn);
                actions.appendChild(delBtn);

                row.appendChild(textSpan);
                row.appendChild(tag);
                row.appendChild(actions);
                memList.appendChild(row);
            });
        } catch (err) {
            console.error('Failed to load memories:', err);
            memList.innerHTML = '<p class="list-empty">Could not read the ledger.</p>';
        }
    }

    if (memoryBtn && memoryPop) {
        memoryBtn.addEventListener('click', () => {
            const hidden = memoryPop.classList.contains('hidden');
            memoryPop.classList.toggle('hidden');
            memoryBtn.classList.toggle('on', hidden);
            memoryBtn.setAttribute('aria-pressed', String(hidden));
            if (hidden) {
                loadMemories();
            }
        });
    }

    if (memClear) {
        memClear.addEventListener('click', async () => {
            if (!accessToken) return;
            if (window.confirm('Clear all entries from the ledger?')) {
                await fetch('/api/memories', { method: 'DELETE', headers: authHeaders() });
                loadMemories();
                toast('Ledger cleared');
            }
        });
    }

    // ============ Initialize ============
    checkSession();
    renderThread();
    if (input) input.focus();
})();
