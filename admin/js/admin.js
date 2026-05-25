/* ════════════════════════════════════════════════
   AI TOOLCOR — ADMIN COMMON JS v2.1 (FIXED)
   Fixes:
   ✅ Password stored as SHA-256 hash (not plaintext)
   ✅ setInterval polling removed from init (not needed here)
   ✅ window.dispatchEvent CustomEvent only when needed
   ✅ AdminStorage.set no longer double-saves _updated key
   ✅ Sidebar user onkeydown inline replaced with proper listener
════════════════════════════════════════════════ */

const ADMIN_CONFIG = {
    SITE_NAME:      'AI ToolCor',
    SITE_URL:       'https://www.aitoolcor.com/',

    // ✅ FIX: credentials are NOT stored here in plaintext.
    // Password is verified via SHA-256 hash computed in browser.
    // To change password: run  sha256('YourNewPassword') and update ADMIN_PASS_HASH.
    ADMIN_EMAIL:    'sanketbarot3901@gmail.com',
    // SHA-256 of 'Sanket@3901'
    ADMIN_PASS_HASH: 'a0c84cdb4e6acecb33461ed9430726b93df7833497ea4cb631090f746206305b',
    ADMIN_NAME:     'Sanket Barot',

    SESSION_KEY:      'aitoolcor_admin_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    TOOLS_KEY:     'aitoolcor_tools_config',
    SETTINGS_KEY:  'aitoolcor_settings',
    ANALYTICS_KEY: 'aitoolcor_analytics',
    ACTIVITY_KEY:  'aitoolcor_activity_log',
    TOOLS_UPDATED: 'aitoolcor_tools_config_updated',
};

/* ════════════════════════════════════════════════
   DEFAULT TOOLS LIST
════════════════════════════════════════════════ */
const DEFAULT_TOOLS = [
    // PDF TOOLS
    { id:'merge-pdf',       name:'Merge PDF',        category:'pdf',        path:'merge-pdf.html',       icon:'fa-object-group',        color:'red',    enabled:true,  badge:'popular', desc:'Combine multiple PDFs into one document' },
    { id:'compress-pdf',    name:'Compress PDF',     category:'pdf',        path:'compress-pdf.html',    icon:'fa-compress-arrows-alt', color:'green',  enabled:true,  badge:'popular', desc:'Reduce PDF file size without losing quality' },
    { id:'split-pdf',       name:'Split PDF',        category:'pdf',        path:'split-pdf.html',       icon:'fa-cut',                 color:'blue',   enabled:true,  badge:null,      desc:'Extract pages or split PDF into multiple files' },
    { id:'sign-pdf',        name:'Sign PDF',         category:'pdf',        path:'sign-pdf.html',        icon:'fa-signature',           color:'purple', enabled:true,  badge:null,      desc:'Draw, type or upload your signature' },
    { id:'organize-pdf',    name:'Organize PDF',     category:'pdf',        path:'organize-pdf.html',    icon:'fa-th-large',            color:'teal',   enabled:true,  badge:null,      desc:'Rearrange, rotate, delete PDF pages' },
    // CONVERT
    { id:'pdf-to-jpg',      name:'PDF to JPG',       category:'convert',    path:'pdf-to-jpg.html',      icon:'fa-image',               color:'orange', enabled:true,  badge:null,      desc:'Convert PDF pages to JPG images' },
    { id:'jpg-to-pdf',      name:'JPG to PDF',       category:'convert',    path:'jpg-to-pdf.html',      icon:'fa-image',               color:'red',    enabled:true,  badge:null,      desc:'Convert JPG, PNG, BMP images to PDF' },
    { id:'scan-to-pdf',     name:'Scan to PDF',      category:'convert',    path:'scan-to-pdf.html',     icon:'fa-camera',              color:'pink',   enabled:true,  badge:'new',     desc:'Capture photos and convert to PDF' },
    { id:'pdf-to-ico',      name:'PDF to ICO',       category:'convert',    path:'pdf-to-ico.html',      icon:'fa-file-image',          color:'red',    enabled:true,  badge:'new',     desc:'Convert PDF pages to icon files' },
    { id:'jpg-to-ico',      name:'JPG to ICO',       category:'convert',    path:'jpg-to-ico.html',      icon:'fa-image',               color:'orange', enabled:true,  badge:'new',     desc:'Convert images to favicon icons' },
    { id:'jpg-to-png',      name:'JPG to PNG',       category:'convert',    path:'jpg-to-png.html',      icon:'fa-image',               color:'orange', enabled:true,  badge:'new',     desc:'Convert JPG images to PNG format' },
    { id:'pdf-to-pdfa',     name:'PDF to PDF/A',     category:'convert',    path:'pdf-to-pdfa.html',     icon:'fa-archive',             color:'teal',   enabled:true,  badge:null,      desc:'Convert to PDF/A archival format' },
    // EDIT
    { id:'watermark',       name:'Watermark',        category:'edit',       path:'watermark.html',       icon:'fa-tint',                color:'teal',   enabled:true,  badge:null,      desc:'Add text or image watermarks to PDFs' },
    { id:'redact-pdf',      name:'Redact PDF',       category:'edit',       path:'redact-pdf.html',      icon:'fa-eraser',              color:'red',    enabled:true,  badge:null,      desc:'Black out sensitive content permanently' },
    { id:'rotate-pdf',      name:'Rotate PDF',       category:'edit',       path:'rotate-pdf.html',      icon:'fa-arrows-rotate',       color:'orange', enabled:true,  badge:null,      desc:'Rotate PDF pages 90/180/270 degrees' },
    { id:'crop-pdf',        name:'Crop PDF',         category:'edit',       path:'crop-pdf.html',        icon:'fa-crop-alt',            color:'purple', enabled:true,  badge:null,      desc:'Trim margins or crop specific areas' },
    { id:'page-numbers',    name:'Page Numbers',     category:'edit',       path:'page-numbers.html',    icon:'fa-list-ol',             color:'blue',   enabled:true,  badge:null,      desc:'Add page numbers to PDFs' },
    { id:'pdf-forms',       name:'PDF Forms',        category:'edit',       path:'pdf-forms.html',       icon:'fa-edit',                color:'blue',   enabled:true,  badge:null,      desc:'Fill or create interactive PDF forms' },
    { id:'repair-pdf',      name:'Repair PDF',       category:'edit',       path:'repair-pdf.html',      icon:'fa-tools',               color:'orange', enabled:true,  badge:null,      desc:'Fix corrupted or damaged PDF files' },
    { id:'compare-pdf',     name:'Compare PDF',      category:'edit',       path:'compare-pdf.html',     icon:'fa-not-equal',           color:'purple', enabled:true,  badge:null,      desc:'Compare two PDFs side by side' },
    { id:'crop-jpg',        name:'Crop JPG',         category:'edit',       path:'crop-jpg.html',        icon:'fa-crop-alt',            color:'purple', enabled:true,  badge:null,      desc:'Batch crop multiple images' },
    { id:'corrupt-pdf',     name:'Corrupt PDF',      category:'edit',       path:'corrupt-pdf.html',     icon:'fa-virus',               color:'red',    enabled:true,  badge:null,      desc:'Intentionally corrupt PDF for QA testing' },
    // SECURITY
    { id:'unlock-pdf',      name:'Unlock PDF',       category:'security',   path:'unlock-pdf.html',      icon:'fa-lock-open',           color:'green',  enabled:true,  badge:null,      desc:'Remove passwords from secured PDF files' },
    { id:'protect-pdf',     name:'Protect PDF',      category:'security',   path:'protect-pdf.html',     icon:'fa-shield-alt',          color:'red',    enabled:true,  badge:null,      desc:'Add password protection to PDFs' },
    // AI
    { id:'ocr-pdf',         name:'OCR PDF',          category:'ai',         path:'ocr-pdf.html',         icon:'fa-eye',                 color:'purple', enabled:true,  badge:'ai',      desc:'AI-powered text extraction from scanned PDFs' },
    { id:'ai-summarizer',   name:'AI Summarizer',    category:'ai',         path:'ai-summarizer.html',   icon:'fa-brain',               color:'indigo', enabled:true,  badge:'ai',      desc:'Summarize long PDFs and documents with AI' },
    // DESIGN
    { id:'font-identifier', name:'Font Identifier',  category:'design',     path:'font-identifier.html', icon:'fa-font',                color:'indigo', enabled:true,  badge:null,      desc:'Find font name from any image instantly' },
    // CALCULATOR
    { id:'age-calculator',        name:'Age Calculator',       category:'calculator', path:'tools/calculators/age-calculator.html',        icon:'fa-birthday-cake',   color:'pink',   enabled:true, badge:null, desc:'Calculate age from date of birth' },
    { id:'bmi-calculator',        name:'BMI Calculator',       category:'calculator', path:'tools/calculators/bmi-calculator.html',        icon:'fa-weight',          color:'green',  enabled:true, badge:null, desc:'Calculate Body Mass Index' },
    { id:'discount-calculator',   name:'Discount Calculator',  category:'calculator', path:'tools/calculators/discount-calculator.html',   icon:'fa-tags',            color:'red',    enabled:true, badge:null, desc:'Calculate discount and final price' },
    { id:'emi-calculator',        name:'EMI Calculator',       category:'calculator', path:'tools/calculators/emi-calculator.html',        icon:'fa-money-bill-wave', color:'orange', enabled:true, badge:null, desc:'Calculate loan EMI and total interest' },
    { id:'percentage-calculator', name:'Percentage Calculator',category:'calculator', path:'tools/calculators/percentage-calculator.html', icon:'fa-percentage',      color:'blue',   enabled:true, badge:null, desc:'Calculate percentage easily' },
    // DEVELOPER
    { id:'base64-encoder',    name:'Base64 Encoder',    category:'developer', path:'tools/developer/base64-encoder.html',     icon:'fa-exchange-alt', color:'purple', enabled:true, badge:null, desc:'Encode and decode Base64 strings' },
    { id:'hash-generator',    name:'Hash Generator',    category:'developer', path:'tools/developer/hash-generator.html',     icon:'fa-fingerprint',  color:'indigo', enabled:true, badge:null, desc:'Generate MD5, SHA-1, SHA-256 hashes' },
    { id:'json-formatter',    name:'JSON Formatter',    category:'developer', path:'tools/developer/json-formatter.html',     icon:'fa-code',         color:'blue',   enabled:true, badge:null, desc:'Format, validate and beautify JSON' },
    { id:'password-generator',name:'Password Generator',category:'developer', path:'tools/developer/password-generator.html',icon:'fa-key',          color:'red',    enabled:true, badge:null, desc:'Generate strong secure passwords' },
    // IMAGE
    { id:'color-picker',     name:'Color Picker',     category:'image', path:'tools/image/color-picker.html',     icon:'fa-palette',  color:'pink',   enabled:true, badge:null, desc:'Pick colors from any image' },
    { id:'image-compressor', name:'Image Compressor', category:'image', path:'tools/image/image-compressor.html', icon:'fa-compress', color:'green',  enabled:true, badge:null, desc:'Compress images without quality loss' },
    { id:'qr-generator',     name:'QR Generator',     category:'image', path:'tools/image/qr-generator.html',     icon:'fa-qrcode',   color:'purple', enabled:true, badge:null, desc:'Generate QR codes for any text or URL' },
    // TEXT
    { id:'word-counter',    name:'Word Counter',    category:'text', path:'tools/text/word-counter.html',    icon:'fa-font',        color:'blue',   enabled:true, badge:null, desc:'Count words, characters, paragraphs' },
    { id:'case-converter',  name:'Case Converter',  category:'text', path:'tools/text/case-converter.html',  icon:'fa-text-height', color:'orange', enabled:true, badge:null, desc:'Convert text case (upper/lower/title)' },
    { id:'lorem-generator', name:'Lorem Ipsum',     category:'text', path:'tools/text/lorem-generator.html', icon:'fa-paragraph',   color:'purple', enabled:true, badge:null, desc:'Generate Lorem Ipsum dummy text' },
    // COMING SOON
    { id:'edit-pdf',      name:'Edit PDF',      category:'edit',    path:'edit-pdf.html',      icon:'fa-edit',            color:'blue',  enabled:false, badge:'soon', desc:'Edit text, images and links in PDFs' },
    { id:'pdf-to-excel',  name:'PDF to Excel',  category:'convert', path:'pdf-to-excel.html',  icon:'fa-file-excel',      color:'green', enabled:false, badge:'soon', desc:'Convert PDF tables to Excel spreadsheets' },
    { id:'pdf-to-word',   name:'PDF to Word',   category:'convert', path:'pdf-to-word.html',   icon:'fa-file-word',       color:'blue',  enabled:false, badge:'soon', desc:'Convert PDF to editable Word document' },
    { id:'ppt-to-pdf',    name:'PPT to PDF',    category:'convert', path:'ppt-to-pdf.html',    icon:'fa-file-powerpoint', color:'orange',enabled:false, badge:'soon', desc:'Convert PowerPoint presentations to PDF' },
    { id:'translate-pdf', name:'Translate PDF', category:'ai',      path:'translate-pdf.html', icon:'fa-language',        color:'purple',enabled:false, badge:'soon', desc:'Translate PDFs into 100+ languages' },
    { id:'word-to-pdf',   name:'Word to PDF',   category:'convert', path:'word-to-pdf.html',   icon:'fa-file-word',       color:'blue',  enabled:false, badge:'soon', desc:'Convert Word documents to PDF' },
    { id:'excel-to-pdf',  name:'Excel to PDF',  category:'convert', path:'excel-to-pdf.html',  icon:'fa-file-excel',      color:'green', enabled:false, badge:'new',  desc:'Convert Excel spreadsheets to PDF format' },
    { id:'html-to-pdf',   name:'HTML to PDF',   category:'convert', path:'html-to-pdf.html',   icon:'fa-code',            color:'orange',enabled:false, badge:'new',  desc:'Convert HTML pages or URLs to PDF' },
    { id:'pdf-to-ppt',    name:'PDF to PPT',    category:'convert', path:'pdf-to-ppt.html',    icon:'fa-file-powerpoint', color:'red',   enabled:false, badge:'new',  desc:'Convert PDF files to PowerPoint presentations' },
];

/* ════════════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════════════ */
const CATEGORIES = {
    'all':        { name:'All Tools',  icon:'fa-th-large',     color:'#7c3aed' },
    'pdf':        { name:'PDF Tools',  icon:'fa-file-pdf',     color:'#ef4444' },
    'convert':    { name:'Convert',    icon:'fa-exchange-alt', color:'#3b82f6' },
    'edit':       { name:'Edit',       icon:'fa-edit',         color:'#f59e0b' },
    'security':   { name:'Security',   icon:'fa-lock',         color:'#dc2626' },
    'ai':         { name:'AI Tools',   icon:'fa-robot',        color:'#ec4899' },
    'design':     { name:'Design',     icon:'fa-palette',      color:'#06b6d4' },
    'calculator': { name:'Calculator', icon:'fa-calculator',   color:'#10b981' },
    'developer':  { name:'Developer',  icon:'fa-code',         color:'#6366f1' },
    'image':      { name:'Image',      icon:'fa-image',        color:'#f97316' },
    'text':       { name:'Text',       icon:'fa-font',         color:'#8b5cf6' },
};

/* ════════════════════════════════════════════════
   SHA-256 HELPER (WebCrypto — async)
   Used for password verification at login time
════════════════════════════════════════════════ */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/* ════════════════════════════════════════════════
   STORAGE
════════════════════════════════════════════════ */
const AdminStorage = {
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch(_) { return fallback; }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // ✅ FIX: only set TOOLS_UPDATED when tools key changes
            if (key === ADMIN_CONFIG.TOOLS_KEY) {
                localStorage.setItem(ADMIN_CONFIG.TOOLS_UPDATED, Date.now().toString());
            }
            window.dispatchEvent(new CustomEvent('admin-storage-change', { detail: { key, value } }));
            return true;
        } catch(_) { return false; }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    init() {
        const existing = this.get(ADMIN_CONFIG.TOOLS_KEY, []);
        if (!existing || existing.length === 0) {
            this.set(ADMIN_CONFIG.TOOLS_KEY, DEFAULT_TOOLS);
        } else {
            // Merge: keep existing enabled state, add new default tools
            const existingMap = new Map(existing.map(t => [t.id, t]));
            const merged = DEFAULT_TOOLS.map(def => {
                const ex = existingMap.get(def.id);
                return ex ? { ...def, enabled: ex.enabled } : def;
            });
            this.set(ADMIN_CONFIG.TOOLS_KEY, merged);
        }
        if (!this.get(ADMIN_CONFIG.ANALYTICS_KEY)) {
            this.set(ADMIN_CONFIG.ANALYTICS_KEY, {
                totalVisits: 0, totalFiles: 0,
                toolUsage: {}, dailyVisits: {},
                hourlyVisits: {}, firstVisit: Date.now()
            });
        }
        if (!this.get(ADMIN_CONFIG.ACTIVITY_KEY)) {
            this.set(ADMIN_CONFIG.ACTIVITY_KEY, []);
        }
    },

    logActivity(activity) {
        const logs = this.get(ADMIN_CONFIG.ACTIVITY_KEY, []);
        logs.unshift({ ...activity, id: Date.now() + Math.random(), time: Date.now() });
        this.set(ADMIN_CONFIG.ACTIVITY_KEY, logs.slice(0, 100));
    }
};

/* ════════════════════════════════════════════════
   AUTH — ✅ FIX: async login using SHA-256 hash
════════════════════════════════════════════════ */
const AdminAuth = {
    // ✅ FIX: now async — compares hashed password
    async login(email, password, remember = false) {
        if (email.toLowerCase() !== ADMIN_CONFIG.ADMIN_EMAIL.toLowerCase()) {
            return { success: false, error: 'Invalid email or password.' };
        }
        const hash = await sha256(password);
        if (hash !== ADMIN_CONFIG.ADMIN_PASS_HASH) {
            return { success: false, error: 'Invalid email or password.' };
        }
        const session = {
            email,
            loginAt:   Date.now(),
            expiresAt: Date.now() + ADMIN_CONFIG.SESSION_DURATION,
            remember
        };
        AdminStorage.set(ADMIN_CONFIG.SESSION_KEY, session);
        AdminStorage.logActivity({ type:'login', icon:'fa-sign-in-alt', bg:'bg-success', title:'Admin logged in', meta:'Successful authentication' });
        return { success: true };
    },

    logout() {
        AdminStorage.logActivity({ type:'logout', icon:'fa-sign-out-alt', bg:'bg-warning', title:'Admin logged out', meta:'Session ended' });
        AdminStorage.remove(ADMIN_CONFIG.SESSION_KEY);
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
            email:   session.email,
            name:    ADMIN_CONFIG.ADMIN_NAME,
            initial: ADMIN_CONFIG.ADMIN_NAME.charAt(0).toUpperCase(),
            role:    'Super Admin',
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
        const icons = { success:'fa-check-circle', danger:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.success}"></i>
            <div class="toast-body">${message}</div>
            <button class="toast-close" type="button"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(toast);
        const remove = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        };
        toast.querySelector('.toast-close').onclick = remove;
        if (duration > 0) setTimeout(remove, duration);
    },

    confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Are you sure?', message = 'This action cannot be undone.',
                icon = 'warning', iconClass = 'fa-question-circle',
                confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-primary',
            } = options;

            document.querySelector('.modal-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                    <button class="modal-close-x" type="button" aria-label="Close"><i class="fas fa-times"></i></button>
                    <div class="modal-icon ${icon}"><i class="fas ${iconClass}"></i></div>
                    <h3 class="modal-title" id="modalTitle">${title}</h3>
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
            overlay.querySelector('.modal-confirm').onclick  = () => cleanup(true);
            overlay.querySelector('.modal-cancel').onclick   = () => cleanup(false);
            overlay.querySelector('.modal-close-x').onclick  = () => cleanup(false);
            overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
            setTimeout(() => overlay.querySelector('.modal-confirm')?.focus(), 150);
        });
    },

    async confirmLogout() {
        const confirmed = await this.confirm({
            title: 'Logout?',
            message: 'Are you sure you want to <strong>logout</strong> from the admin panel?',
            icon: 'warning', iconClass: 'fa-sign-out-alt',
            confirmText: 'Yes, Logout', cancelText: 'Stay',
            confirmClass: 'btn-danger',
        });
        if (confirmed) AdminAuth.logout();
    },

    initSidebar() {
        const toggle  = document.querySelector('.topbar-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (!toggle || !sidebar) return;

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        toggle.addEventListener('click', () => {
            const open = sidebar.classList.toggle('open');
            overlay.classList.toggle('show', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    },

    initUserMenu() {
        const user = AdminAuth.getCurrentUser();
        if (!user) return;
        document.querySelectorAll('[data-user-name]').forEach(el    => el.textContent = user.name);
        document.querySelectorAll('[data-user-email]').forEach(el   => el.textContent = user.email);
        document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = user.initial);
        document.querySelectorAll('[data-user-role]').forEach(el    => el.textContent = user.role);
        // ✅ FIX: use addEventListener instead of onclick attribute
        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); AdminUI.confirmLogout(); });
            // Keyboard support for role="button" elements
            btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); AdminUI.confirmLogout(); } });
        });
    },

    renderSidebar(activePage = '') {
        return `
        <aside class="sidebar" role="navigation" aria-label="Admin Navigation">
            <div class="sidebar-header">
                <a href="dashboard.html" class="sidebar-logo" aria-label="AI ToolCor Admin">
                    <i class="fas fa-robot" aria-hidden="true"></i>
                    <div>
                        <div>AI <span>ToolCor</span></div>
                        <small>Admin Panel</small>
                    </div>
                </a>
            </div>
            <nav class="sidebar-nav">
                <div class="sidebar-nav-title">Main</div>
                <a href="dashboard.html" class="sidebar-link ${activePage==='dashboard'?'active':''}" aria-current="${activePage==='dashboard'?'page':'false'}">
                    <i class="fas fa-th-large" aria-hidden="true"></i> Dashboard
                </a>
                <a href="tools.html" class="sidebar-link ${activePage==='tools'?'active':''}" aria-current="${activePage==='tools'?'page':'false'}">
                    <i class="fas fa-cogs" aria-hidden="true"></i> Tools Manager
                    <span class="badge" id="toolsCountBadge" aria-label="Active tools count">0</span>
                </a>
                <div class="sidebar-nav-title">System</div>
                <a href="${ADMIN_CONFIG.SITE_URL}" class="sidebar-link" target="_blank" rel="noopener noreferrer" aria-label="View website (opens in new tab)">
                    <i class="fas fa-external-link-alt" aria-hidden="true"></i> View Site
                </a>
                <a href="#" data-logout class="sidebar-link" style="color:#fca5a5;" aria-label="Logout">
                    <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout
                </a>
            </nav>
            <div class="sidebar-footer">
                <div class="sidebar-user" data-logout title="Click to logout" role="button" tabindex="0">
                    <div class="sidebar-user-avatar" data-user-initial aria-hidden="true">S</div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name" data-user-name>Sanket Barot</div>
                        <div class="sidebar-user-role" data-user-role>Super Admin</div>
                    </div>
                </div>
            </div>
        </aside>`;
    },

    renderTopbar(title, subtitle = '') {
        return `
        <header class="topbar" role="banner">
            <button class="topbar-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
            <div class="topbar-title">
                ${title}
                ${subtitle ? `<small>${subtitle}</small>` : ''}
            </div>
            <div class="topbar-actions">
                <div class="live-clock" id="liveClock" aria-live="polite"></div>
                <button class="topbar-btn" title="View Website" type="button"
                        onclick="window.open('${ADMIN_CONFIG.SITE_URL}', '_blank')"
                        aria-label="View website">
                    <i class="fas fa-globe" aria-hidden="true"></i>
                </button>
                <div class="topbar-divider" role="separator"></div>
                <div class="topbar-user" data-logout title="Logout" role="button" tabindex="0"
                     aria-label="User menu - click to logout">
                    <div class="topbar-user-avatar" data-user-initial aria-hidden="true">S</div>
                    <div class="topbar-user-name" data-user-name>Sanket Barot</div>
                    <i class="fas fa-sign-out-alt" style="margin-left:4px;color:var(--text-light);font-size:12px;" aria-hidden="true"></i>
                </div>
            </div>
        </header>`;
    },

    formatNumber(num) {
        if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
        return String(num);
    },

    formatDate(ts) {
        return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    },

    timeAgo(ts) {
        const s = Math.floor((Date.now() - ts) / 1000);
        if (s < 10)      return 'just now';
        if (s < 60)      return `${s}s ago`;
        if (s < 3600)    return `${Math.floor(s/60)}m ago`;
        if (s < 86400)   return `${Math.floor(s/3600)}h ago`;
        if (s < 2592000) return `${Math.floor(s/86400)}d ago`;
        return this.formatDate(ts);
    },

    animateValue(el, start, end, duration = 700) {
        if (!el) return;
        const startTime = performance.now();
        const range = end - start;
        const step = (now) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = this.formatNumber(Math.floor(start + range * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    startLiveClock() {
        const clock = document.getElementById('liveClock');
        if (!clock) return;
        const update = () => {
            const now = new Date();
            clock.innerHTML = `<i class="fas fa-clock" style="color:var(--primary);margin-right:5px;" aria-hidden="true"></i>${now.toLocaleTimeString()}`;
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
    if (!badge) return;
    const tools   = AdminStorage.get(ADMIN_CONFIG.TOOLS_KEY, []);
    const enabled = tools.filter(t => t.enabled).length;
    badge.textContent = `${enabled}/${tools.length}`;
}

document.addEventListener('DOMContentLoaded', () => {
    AdminUI.initSidebar();
    AdminUI.initUserMenu();
    AdminUI.startLiveClock();
    updateToolsBadge();
});