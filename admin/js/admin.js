/* ════════════════════════════════════════════════
   AI TOOLCOR — ADMIN COMMON JS
   Website: https://www.aitoolcor.com/
   Live data + Real-time sync + Custom modals
════════════════════════════════════════════════ */

const ADMIN_CONFIG = {
    /* Site Info */
    SITE_NAME: 'AI ToolCor',
    SITE_URL: 'https://www.aitoolcor.com/',

    /* Admin Credentials */
    ADMIN_EMAIL: 'sanketbarot3901@gmail.com',
    ADMIN_PASSWORD: 'Sanket@3901',
    ADMIN_NAME: 'Sanket Barot',

    /* Session */
    SESSION_KEY: 'aitoolcor_admin_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000,

    /* Storage Keys */
    TOOLS_KEY: 'aitoolcor_tools_config',
    SETTINGS_KEY: 'aitoolcor_settings',
    ANALYTICS_KEY: 'aitoolcor_analytics',
    ACTIVITY_KEY: 'aitoolcor_activity_log',
};

/* ════════════════════════════════════════════════
   DEFAULT TOOLS LIST
════════════════════════════════════════════════ */
const DEFAULT_TOOLS = [
    { id: 'merge-pdf',       name: 'Merge PDF',        category: 'organize', icon: 'fa-object-group',        color: 'red',    enabled: true, badge: 'popular', desc: 'Combine multiple PDFs into one document' },
    { id: 'compress-pdf',    name: 'Compress PDF',     category: 'organize', icon: 'fa-compress-arrows-alt', color: 'green',  enabled: true, badge: 'popular', desc: 'Reduce PDF file size without losing quality' },
    { id: 'split-pdf',       name: 'Split PDF',        category: 'organize', icon: 'fa-cut',                 color: 'blue',   enabled: true, badge: null,      desc: 'Extract pages or split PDF into multiple files' },
    { id: 'sign-pdf',        name: 'Sign PDF',         category: 'edit',     icon: 'fa-signature',           color: 'purple', enabled: true, badge: null,      desc: 'Draw, type or upload your signature' },
    { id: 'pdf-to-jpg',      name: 'PDF to JPG',       category: 'convert',  icon: 'fa-image',               color: 'orange', enabled: true, badge: null,      desc: 'Convert PDF pages to images' },
    { id: 'jpg-to-pdf',      name: 'JPG to PDF',       category: 'convert',  icon: 'fa-image',               color: 'red',    enabled: true, badge: null,      desc: 'Convert JPG, PNG, BMP to PDF' },
    { id: 'ocr-pdf',         name: 'OCR PDF',          category: 'ai',       icon: 'fa-eye',                 color: 'purple', enabled: true, badge: 'ai',      desc: 'AI-powered text extraction from scanned PDFs' },
    { id: 'font-identifier', name: 'Font Identifier',  category: 'design',   icon: 'fa-font',                color: 'indigo', enabled: true, badge: null,      desc: 'Find font name from any image' },
    { id: 'unlock-pdf',      name: 'Unlock PDF',       category: 'security', icon: 'fa-lock-open',           color: 'green',  enabled: true, badge: null,      desc: 'Remove password from PDF files' },
    { id: 'protect-pdf',     name: 'Protect PDF',      category: 'security', icon: 'fa-shield-alt',          color: 'red',    enabled: true, badge: null,      desc: 'Add password protection to PDFs' },
    { id: 'watermark',       name: 'Watermark',        category: 'edit',     icon: 'fa-tint',                color: 'teal',   enabled: true, badge: null,      desc: 'Add text or image watermarks to PDFs' },
    { id: 'redact-pdf',      name: 'Redact PDF',       category: 'edit',     icon: 'fa-eraser',              color: 'red',    enabled: true, badge: null,      desc: 'Black out sensitive content permanently' },
    { id: 'organize-pdf',    name: 'Organize PDF',     category: 'organize', icon: 'fa-th-large',            color: 'teal',   enabled: true, badge: null,      desc: 'Rearrange, rotate, delete PDF pages' },
    { id: 'rotate-pdf',      name: 'Rotate PDF',       category: 'edit',     icon: 'fa-arrows-rotate',       color: 'orange', enabled: true, badge: null,      desc: 'Rotate PDF pages 90/180/270 degrees' },
    { id: 'crop-pdf',        name: 'Crop PDF',         category: 'edit',     icon: 'fa-crop-alt',            color: 'purple', enabled: true, badge: null,      desc: 'Trim margins or crop specific areas' },
    { id: 'page-numbers',    name: 'Page Numbers',     category: 'edit',     icon: 'fa-list-ol',             color: 'blue',   enabled: true, badge: null,      desc: 'Add page numbers to headers or footers' },
    { id: 'scan-to-pdf',     name: 'Scan to PDF',      category: 'convert',  icon: 'fa-camera',              color: 'pink',   enabled: true, badge: 'new',     desc: 'Capture photos and convert to PDF' },
    { id: 'pdf-forms',       name: 'PDF Forms',        category: 'edit',     icon: 'fa-edit',                color: 'blue',   enabled: true, badge: null,      desc: 'Fill or create interactive PDF forms' },
    { id: 'repair-pdf',      name: 'Repair PDF',       category: 'edit',     icon: 'fa-tools',               color: 'orange', enabled: true, badge: null,      desc: 'Fix corrupted or damaged PDF files' },
    { id: 'compare-pdf',     name: 'Compare PDF',      category: 'edit',     icon: 'fa-not-equal',           color: 'purple', enabled: true, badge: null,      desc: 'Compare two PDFs side by side' },
    { id: 'pdf-to-pdfa',     name: 'PDF to PDF/A',     category: 'convert',  icon: 'fa-archive',             color: 'teal',   enabled: true, badge: null,      desc: 'Convert to PDF/A archival format' },
    { id: 'crop-jpg',        name: 'Crop JPG',         category: 'edit',     icon: 'fa-crop-alt',            color: 'purple', enabled: true, badge: null,      desc: 'Batch crop multiple images' },
    { id: 'pdf-to-ico',      name: 'PDF to ICO',       category: 'convert',  icon: 'fa-file-image',          color: 'red',    enabled: true, badge: 'new',     desc: 'Convert PDF pages to icon files' },
    { id: 'jpg-to-ico',      name: 'JPG to ICO',       category: 'convert',  icon: 'fa-image',               color: 'orange', enabled: true, badge: 'new',     desc: 'Convert images to favicon icons' },
    { id: 'corrupt-pdf',     name: 'Corrupt PDF',      category: 'edit',     icon: 'fa-virus',               color: 'red',    enabled: true, badge: null,      desc: 'Intentionally corrupt PDF for QA testing' },
];

const CATEGORIES = {
    'all':      { name: 'All Tools',  icon: 'fa-th-large',     color: '#7c3aed' },
    'organize': { name: 'Organize',   icon: 'fa-layer-group',  color: '#10b981' },
    'convert':  { name: 'Convert',    icon: 'fa-exchange-alt', color: '#3b82f6' },
    'edit':     { name: 'Edit',       icon: 'fa-edit',         color: '#f59e0b' },
    'security': { name: 'Security',   icon: 'fa-lock',         color: '#ef4444' },
    'ai':       { name: 'AI',         icon: 'fa-robot',        color: '#ec4899' },
    'design':   { name: 'Design',     icon: 'fa-palette',      color: '#06b6d4' },
};

/* ════════════════════════════════════════════════
   STORAGE HELPERS
════════════════════════════════════════════════ */
const AdminStorage = {
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch (_) { return fallback; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));
            return true;
        } catch (_) { return false; }
    },
    remove(key) { localStorage.removeItem(key); },

    init() {
        if (!this.get(ADMIN_CONFIG.TOOLS_KEY)) {
            this.set(ADMIN_CONFIG.TOOLS_KEY, DEFAULT_TOOLS);
        }
        if (!this.get(ADMIN_CONFIG.ANALYTICS_KEY)) {
            this.set(ADMIN_CONFIG.ANALYTICS_KEY, {
                totalVisits: 0,
                totalFiles: 0,
                toolUsage: {},
                dailyVisits: {},
                hourlyVisits: {},
                devices: { desktop: 0, mobile: 0, tablet: 0 },
                browsers: {},
                countries: {},
                referrers: {},
                firstVisit: Date.now()
            });
        }
        if (!this.get(ADMIN_CONFIG.ACTIVITY_KEY)) {
            this.set(ADMIN_CONFIG.ACTIVITY_KEY, []);
        }
    },

    logActivity(activity) {
        const logs = this.get(ADMIN_CONFIG.ACTIVITY_KEY, []);
        logs.unshift({
            ...activity,
            id: Date.now() + Math.random(),
            time: Date.now()
        });
        this.set(ADMIN_CONFIG.ACTIVITY_KEY, logs.slice(0, 100));
    }
};

/* ════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════ */
const AdminAuth = {
    login(email, password, remember = false) {
        if (email.toLowerCase() !== ADMIN_CONFIG.ADMIN_EMAIL.toLowerCase() ||
            password !== ADMIN_CONFIG.ADMIN_PASSWORD) {
            return { success: false, error: 'Invalid email or password' };
        }
        const session = {
            email,
            loginAt: Date.now(),
            expiresAt: Date.now() + ADMIN_CONFIG.SESSION_DURATION,
            remember
        };
        AdminStorage.set(ADMIN_CONFIG.SESSION_KEY, session);
        AdminStorage.logActivity({
            type: 'login',
            icon: 'fa-sign-in-alt',
            bg: 'bg-success',
            title: 'Admin logged in',
            meta: 'Successful authentication'
        });
        return { success: true };
    },

    logout() {
        // Remove session FIRST for instant logout
        AdminStorage.remove(ADMIN_CONFIG.SESSION_KEY);
        AdminStorage.logActivity({
            type: 'logout',
            icon: 'fa-sign-out-alt',
            bg: 'bg-warning',
            title: 'Admin logged out',
            meta: 'Session ended'
        });
        // Instant redirect (replace prevents back button)
        window.location.replace('login.html');
    },

    isLoggedIn() {
        const session = AdminStorage.get(ADMIN_CONFIG.SESSION_KEY);
        if (!session) return false;
        if (Date.now() > session.expiresAt) {
            AdminStorage.remove(ADMIN_CONFIG.SESSION_KEY);
            return false;
        }
        return true;
    },

    getCurrentUser() {
        const session = AdminStorage.get(ADMIN_CONFIG.SESSION_KEY);
        if (!session) return null;
        return {
            email: session.email,
            name: ADMIN_CONFIG.ADMIN_NAME,
            initial: ADMIN_CONFIG.ADMIN_NAME.charAt(0).toUpperCase(),
            role: 'Super Admin',
            loginAt: session.loginAt
        };
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.replace('login.html');
            return false;
        }
        return true;
    }
};

/* ════════════════════════════════════════════════
   UI HELPERS
════════════════════════════════════════════════ */
const AdminUI = {
    toast(message, type = 'success', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.success}"></i>
            <div class="toast-body">${message}</div>
            <button class="toast-close" type="button"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(toast);

        const remove = () => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 280);
        };
        toast.querySelector('.toast-close').onclick = remove;
        setTimeout(remove, duration);
    },

    /* ════════════════════════════════════════
       CUSTOM CONFIRM MODAL
    ════════════════════════════════════════ */
    confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Are you sure?',
                message = 'This action cannot be undone.',
                icon = 'warning',
                iconClass = 'fa-question-circle',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                confirmClass = 'btn-primary',
            } = options;

            // Remove any existing modal
            document.querySelector('.modal-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-box">
                    <button class="modal-close-x" type="button" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-icon ${icon}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <h3 class="modal-title">${title}</h3>
                    <p class="modal-message">${message}</p>
                    <div class="modal-actions">
                        <button class="btn btn-outline modal-cancel" type="button">
                            <i class="fas fa-times"></i> ${cancelText}
                        </button>
                        <button class="btn ${confirmClass} modal-confirm" type="button">
                            <i class="fas fa-check"></i> ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Force reflow then add 'show' class for animation
            requestAnimationFrame(() => overlay.classList.add('show'));

            const cleanup = (result) => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 250);
                document.removeEventListener('keydown', escHandler);
                resolve(result);
            };

            const escHandler = (e) => {
                if (e.key === 'Escape') cleanup(false);
                if (e.key === 'Enter')  cleanup(true);
            };
            document.addEventListener('keydown', escHandler);

            overlay.querySelector('.modal-confirm').onclick = () => cleanup(true);
            overlay.querySelector('.modal-cancel').onclick  = () => cleanup(false);
            overlay.querySelector('.modal-close-x').onclick = () => cleanup(false);
            overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };

            // Auto-focus confirm button
            setTimeout(() => overlay.querySelector('.modal-confirm').focus(), 150);
        });
    },

    /* Logout with confirmation - FAST */
    async confirmLogout() {
        const confirmed = await this.confirm({
            title: 'Logout Confirmation',
            message: 'Are you sure you want to <strong>logout</strong> from the admin panel?',
            icon: 'warning',
            iconClass: 'fa-sign-out-alt',
            confirmText: 'Yes, Logout',
            cancelText: 'Stay Logged In',
            confirmClass: 'btn-danger',
        });

        if (confirmed) {
            // INSTANT logout - no delays
            AdminAuth.logout();
        }
    },

    initSidebar() {
        const toggle = document.querySelector('.topbar-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (!toggle || !sidebar) return;

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    },

    initUserMenu() {
        const user = AdminAuth.getCurrentUser();
        if (!user) return;

        document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
        document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
        document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = user.initial);
        document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role);

        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                AdminUI.confirmLogout();
            });
        });
    },

    renderSidebar(activePage = '') {
        return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <a href="dashboard.html" class="sidebar-logo">
                        <i class="fas fa-robot"></i>
                        <div>
                            <div>AI <span>ToolCor</span></div>
                            <small>Admin Panel</small>
                        </div>
                    </a>
                </div>
                <nav class="sidebar-nav">
                    <div class="sidebar-nav-title">Main</div>
                    <a href="dashboard.html" class="sidebar-link ${activePage==='dashboard'?'active':''}">
                        <i class="fas fa-th-large"></i> Dashboard
                    </a>
                    <a href="tools.html" class="sidebar-link ${activePage==='tools'?'active':''}">
                        <i class="fas fa-cogs"></i> Tools Manager
                        <span class="badge" id="toolsCountBadge">0</span>
                    </a>

                    <div class="sidebar-nav-title">System</div>
                    <a href="${ADMIN_CONFIG.SITE_URL}" class="sidebar-link" target="_blank">
                        <i class="fas fa-external-link-alt"></i> View Site
                    </a>
                    <a href="#" data-logout class="sidebar-link" style="color:#fca5a5;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div class="sidebar-user" data-logout title="Click to logout">
                        <div class="sidebar-user-avatar" data-user-initial>S</div>
                        <div class="sidebar-user-info">
                            <div class="sidebar-user-name" data-user-name>Sanket Barot</div>
                            <div class="sidebar-user-role" data-user-role>Super Admin</div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    },

    renderTopbar(title, subtitle = '') {
        return `
            <header class="topbar">
                <button class="topbar-toggle" type="button" aria-label="Toggle menu">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="topbar-title">
                    ${title}
                    ${subtitle ? `<small>${subtitle}</small>` : ''}
                </div>
                <div class="topbar-actions">
                    <div class="live-clock" id="liveClock" style="font-size:13px;font-weight:600;color:var(--text-medium);padding:0 12px;display:none;"></div>
                    <button class="topbar-btn" title="View Site" type="button"
                            onclick="window.open('${ADMIN_CONFIG.SITE_URL}', '_blank')">
                        <i class="fas fa-globe"></i>
                    </button>
                    <div class="topbar-divider"></div>
                    <div class="topbar-user" data-logout title="Click to logout">
                        <div class="topbar-user-avatar" data-user-initial>S</div>
                        <div class="topbar-user-name" data-user-name>Sanket Barot</div>
                        <i class="fas fa-sign-out-alt" style="margin-left:4px;color:var(--text-light);"></i>
                    </div>
                </div>
            </header>
        `;
    },

    formatNumber(num) {
        if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
        return num.toString();
    },

    formatDate(timestamp) {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`;
        if (seconds < 2592000) return `${Math.floor(seconds/86400)}d ago`;
        return this.formatDate(timestamp);
    },

    animateValue(el, start, end, duration = 800) {
        if (!el) return;
        const startTime = performance.now();
        const range = end - start;
        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(start + range * eased);
            el.textContent = this.formatNumber(value);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    startLiveClock() {
        const clock = document.getElementById('liveClock');
        if (!clock) return;
        clock.style.display = 'block';
        const update = () => {
            const now = new Date();
            clock.innerHTML = `<i class="fas fa-clock" style="color:var(--primary);margin-right:6px;"></i>${now.toLocaleTimeString()}`;
        };
        update();
        setInterval(update, 1000);
    }
};

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
AdminStorage.init();

function updateToolsBadge() {
    const badge = document.getElementById('toolsCountBadge');
    if (badge) {
        const tools = AdminStorage.get(ADMIN_CONFIG.TOOLS_KEY, []);
        const enabled = tools.filter(t => t.enabled).length;
        badge.textContent = `${enabled}/${tools.length}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    AdminUI.initSidebar();
    AdminUI.initUserMenu();
    AdminUI.startLiveClock();
    updateToolsBadge();
});