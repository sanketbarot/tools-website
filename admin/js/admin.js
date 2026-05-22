/* ════════════════════════════════════════════════
   AI TOOLCOR — ADMIN COMMON JS
   Website: https://www.aitoolcor.com/
   Single source of truth for ALL tools
════════════════════════════════════════════════ */

const ADMIN_CONFIG = {
    SITE_NAME: 'AI ToolCor',
    SITE_URL: 'https://www.aitoolcor.com/',

    ADMIN_EMAIL: 'sanketbarot3901@gmail.com',
    ADMIN_PASSWORD: 'Sanket@3901',
    ADMIN_NAME: 'Sanket Barot',

    SESSION_KEY: 'aitoolcor_admin_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000,

    TOOLS_KEY: 'aitoolcor_tools_config',
    SETTINGS_KEY: 'aitoolcor_settings',
    ANALYTICS_KEY: 'aitoolcor_analytics',
    ACTIVITY_KEY: 'aitoolcor_activity_log',
};

/* ════════════════════════════════════════════════
   ALL TOOLS — Single source of truth
════════════════════════════════════════════════ */
const DEFAULT_TOOLS = [
    // ═══════ ORGANIZE ═══════
    { id: 'merge-pdf',       name: 'Merge PDF',        category: 'organize', path: 'merge-pdf.html',       icon: 'fa-object-group',        color: 'red',    enabled: true,  badge: 'popular', desc: 'Combine multiple PDFs into one document easily.', keywords: 'merge pdf combine multiple files join' },
    { id: 'compress-pdf',    name: 'Compress PDF',     category: 'organize', path: 'compress-pdf.html',    icon: 'fa-compress-arrows-alt', color: 'green',  enabled: true,  badge: 'popular', desc: 'Reduce PDF file size without losing original quality.', keywords: 'compress pdf reduce size smaller optimize' },
    { id: 'split-pdf',       name: 'Split PDF',        category: 'organize', path: 'split-pdf.html',       icon: 'fa-cut',                 color: 'blue',   enabled: true,  badge: null,      desc: 'Extract specific pages or split PDF into multiple files.', keywords: 'split pdf extract separate pages cut' },
    { id: 'organize-pdf',    name: 'Organize PDF',     category: 'organize', path: 'organize-pdf.html',    icon: 'fa-th-large',            color: 'teal',   enabled: true,  badge: null,      desc: 'Rearrange, rotate, delete, or reorder PDF pages quickly.', keywords: 'organize pdf rearrange delete reorder' },

    // ═══════ CONVERT ═══════
    { id: 'pdf-to-jpg',      name: 'PDF to JPG',       category: 'convert',  path: 'pdf-to-jpg.html',      icon: 'fa-image',               color: 'orange', enabled: true,  badge: null,      desc: 'Extract all pictures or turn PDF pages into images.', keywords: 'pdf to jpg png image convert' },
    { id: 'jpg-to-pdf',      name: 'JPG to PDF',       category: 'convert',  path: 'jpg-to-pdf.html',      icon: 'fa-image',               color: 'red',    enabled: true,  badge: null,      desc: 'Convert JPG, PNG, and BMP images into a PDF file in seconds.', keywords: 'jpg png image to pdf convert' },
    { id: 'scan-to-pdf',     name: 'Scan to PDF',      category: 'convert',  path: 'scan-to-pdf.html',     icon: 'fa-camera',              color: 'pink',   enabled: true,  badge: 'new',     desc: 'Turn pictures from your mobile camera directly into sharp PDFs.', keywords: 'scan camera document photo capture' },
    { id: 'pdf-to-pdfa',     name: 'PDF to PDF/A',     category: 'convert',  path: 'pdf-to-pdfa.html',     icon: 'fa-archive',             color: 'teal',   enabled: true,  badge: null,      desc: 'Convert documents to PDF/A standard for long-term archiving.', keywords: 'pdf to pdfa archival iso standard' },
    { id: 'pdf-to-ico',      name: 'PDF to ICO',       category: 'convert',  path: 'pdf-to-ico.html',      icon: 'fa-file-image',          color: 'red',    enabled: true,  badge: 'new',     desc: 'Convert individual PDF page blocks into .ico desktop icons.', keywords: 'pdf to ico icon favicon converter' },
    { id: 'jpg-to-ico',      name: 'JPG to ICO',       category: 'convert',  path: 'jpg-to-ico.html',      icon: 'fa-image',               color: 'orange', enabled: true,  badge: 'new',     desc: 'Convert any PNG or JPG photo into custom website favicons.', keywords: 'jpg png image to ico icon favicon' },
    { id: 'jpg-to-png',      name: 'JPG to PNG',       category: 'convert',  path: 'jpg-to-png.html',      icon: 'fa-image',               color: 'purple', enabled: true,  badge: 'new',     desc: 'Convert JPG images to PNG format with transparency support.', keywords: 'jpg to png image convert transparent' },
    { id: 'pdf-to-word',     name: 'PDF to Word',      category: 'convert',  path: 'pdf-to-word.html',     icon: 'fa-file-word',           color: 'blue',   enabled: false, badge: 'soon',    desc: 'Convert PDF files to editable Word documents instantly.', keywords: 'pdf to word doc docx convert editable' },
    { id: 'word-to-pdf',     name: 'Word to PDF',      category: 'convert',  path: 'word-to-pdf.html',     icon: 'fa-file-word',           color: 'blue',   enabled: false, badge: 'soon',    desc: 'Convert Word documents to high-quality PDF files easily.', keywords: 'word to pdf doc docx convert' },
    { id: 'pdf-to-excel',    name: 'PDF to Excel',     category: 'convert',  path: 'pdf-to-excel.html',    icon: 'fa-file-excel',          color: 'green',  enabled: false, badge: 'soon',    desc: 'Extract tables from PDFs and convert them to Excel spreadsheets.', keywords: 'pdf to excel xls xlsx tables spreadsheet' },
    { id: 'ppt-to-pdf',      name: 'PPT to PDF',       category: 'convert',  path: 'ppt-to-pdf.html',      icon: 'fa-file-powerpoint',     color: 'orange', enabled: false, badge: 'soon',    desc: 'Convert PowerPoint presentations to professional PDF files.', keywords: 'ppt powerpoint to pdf presentation slides' },

    // ═══════ EDIT ═══════
    { id: 'edit-pdf',        name: 'Edit PDF',         category: 'edit',     path: 'edit-pdf.html',        icon: 'fa-edit',                color: 'purple', enabled: false, badge: 'soon',    desc: 'Edit text, images, and links directly in your PDF documents.', keywords: 'edit pdf text image links modify' },
    { id: 'sign-pdf',        name: 'Sign PDF',         category: 'edit',     path: 'sign-pdf.html',        icon: 'fa-signature',           color: 'purple', enabled: true,  badge: null,      desc: 'Draw, type, or upload your signature to sign documents.', keywords: 'sign pdf signature draw type digital' },
    { id: 'watermark',       name: 'Watermark',        category: 'edit',     path: 'watermark.html',       icon: 'fa-tint',                color: 'teal',   enabled: true,  badge: null,      desc: 'Add custom text or image stamps over your PDF pages.', keywords: 'watermark pdf text image stamp' },
    { id: 'redact-pdf',      name: 'Redact PDF',       category: 'edit',     path: 'redact-pdf.html',      icon: 'fa-eraser',              color: 'red',    enabled: true,  badge: null,      desc: 'Permanently black out and remove sensitive content from PDFs.', keywords: 'redact black out sensitive remove hide' },
    { id: 'rotate-pdf',      name: 'Rotate PDF',       category: 'edit',     path: 'rotate-pdf.html',      icon: 'fa-arrows-rotate',       color: 'orange', enabled: true,  badge: null,      desc: 'Turn pages of your PDF to landscape or portrait mode.', keywords: 'rotate pdf turn flip orientation' },
    { id: 'crop-pdf',        name: 'Crop PDF',         category: 'edit',     path: 'crop-pdf.html',        icon: 'fa-crop-alt',            color: 'purple', enabled: true,  badge: null,      desc: 'Trim the outer margins or crop a specific area in PDFs.', keywords: 'crop pdf trim margins resize' },
    { id: 'page-numbers',    name: 'Page Numbers',     category: 'edit',     path: 'page-numbers.html',    icon: 'fa-list-ol',             color: 'blue',   enabled: true,  badge: null,      desc: 'Insert dynamic page numbering into headers or footers.', keywords: 'page numbers insert footer header' },
    { id: 'pdf-forms',       name: 'PDF Forms',        category: 'edit',     path: 'pdf-forms.html',       icon: 'fa-edit',                color: 'blue',   enabled: true,  badge: null,      desc: 'Fill out interactive forms or build new templates in PDFs.', keywords: 'pdf forms fill fields template' },
    { id: 'repair-pdf',      name: 'Repair PDF',       category: 'edit',     path: 'repair-pdf.html',      icon: 'fa-tools',               color: 'orange', enabled: true,  badge: null,      desc: 'Fix corrupted, damaged, or unreadable PDF documents.', keywords: 'repair pdf fix corrupted damaged' },
    { id: 'compare-pdf',     name: 'Compare PDF',      category: 'edit',     path: 'compare-pdf.html',     icon: 'fa-not-equal',           color: 'purple', enabled: true,  badge: null,      desc: 'Compare two versions of a PDF side-by-side.', keywords: 'compare pdf diff differences side' },
    { id: 'crop-jpg',        name: 'Crop JPG',         category: 'edit',     path: 'crop-jpg.html',        icon: 'fa-crop-alt',            color: 'purple', enabled: true,  badge: null,      desc: 'Trim dimensions or crop multiple photo assets in batch.', keywords: 'crop jpg image batch resize' },
    { id: 'corrupt-pdf',     name: 'Corrupt PDF',      category: 'edit',     path: 'corrupt-pdf.html',     icon: 'fa-virus',               color: 'red',    enabled: true,  badge: null,      desc: 'Intentionally break a PDF file to test system QA states.', keywords: 'corrupt pdf damage break test' },

    // ═══════ SECURITY ═══════
    { id: 'unlock-pdf',      name: 'Unlock PDF',       category: 'security', path: 'unlock-pdf.html',      icon: 'fa-lock-open',           color: 'green',  enabled: true,  badge: null,      desc: 'Remove passwords and restrictions from secured PDF files.', keywords: 'unlock remove password decrypt' },
    { id: 'protect-pdf',     name: 'Protect PDF',      category: 'security', path: 'protect-pdf.html',     icon: 'fa-shield-alt',          color: 'red',    enabled: true,  badge: null,      desc: 'Add strong encryption and custom passwords to PDFs.', keywords: 'protect password encrypt lock' },

    // ═══════ AI ═══════
    { id: 'ocr-pdf',         name: 'OCR PDF',          category: 'ai',       path: 'ocr-pdf.html',         icon: 'fa-eye',                 color: 'purple', enabled: true,  badge: 'ai',      desc: 'Convert scanned PDFs or images into searchable, editable text.', keywords: 'ocr pdf text extract scanned recognition' },
    { id: 'font-identifier', name: 'Font Identifier',  category: 'ai',       path: 'font-identifier.html', icon: 'fa-font',                color: 'indigo', enabled: true,  badge: 'ai',      desc: 'Find out the name of any font from an image instantly.', keywords: 'font identifier find name image detector' },
    { id: 'translate-pdf',   name: 'Translate PDF',    category: 'ai',       path: 'translate-pdf.html',   icon: 'fa-language',            color: 'pink',   enabled: false, badge: 'soon',    desc: 'Translate PDF documents into 100+ languages with AI.', keywords: 'translate pdf language multilingual ai' },
     /* ═══════ CALCULATOR TOOLS (From navbar dropdown) ═══════ */
    { id: 'age-calculator',         name: 'Age Calculator',         category: 'calculator', path: 'tools/calculators/age-calculator.html',         icon: 'fa-birthday-cake',  color: 'pink',   enabled: true, badge: null, desc: 'Calculate age from date of birth' },
    { id: 'bmi-calculator',         name: 'BMI Calculator',         category: 'calculator', path: 'tools/calculators/bmi-calculator.html',         icon: 'fa-weight',         color: 'green',  enabled: true, badge: null, desc: 'Calculate Body Mass Index' },
    { id: 'discount-calculator',    name: 'Discount Calculator',    category: 'calculator', path: 'tools/calculators/discount-calculator.html',    icon: 'fa-tags',           color: 'red',    enabled: true, badge: null, desc: 'Calculate discount and final price' },
    { id: 'emi-calculator',         name: 'EMI Calculator',         category: 'calculator', path: 'tools/calculators/emi-calculator.html',         icon: 'fa-money-bill-wave',color: 'orange', enabled: true, badge: null, desc: 'Calculate loan EMI and total interest' },
    { id: 'percentage-calculator',  name: 'Percentage Calculator',  category: 'calculator', path: 'tools/calculators/percentage-calculator.html',  icon: 'fa-percentage',     color: 'blue',   enabled: true, badge: null, desc: 'Calculate percentage easily' },

    /* ═══════ DEVELOPER TOOLS (From navbar dropdown) ═══════ */
    { id: 'base64-encoder',     name: 'Base64 Encoder',     category: 'developer', path: 'tools/developer/base64-encoder.html',     icon: 'fa-exchange-alt', color: 'purple', enabled: true, badge: null, desc: 'Encode and decode Base64 strings' },
    { id: 'hash-generator',     name: 'Hash Generator',     category: 'developer', path: 'tools/developer/hash-generator.html',     icon: 'fa-fingerprint',  color: 'indigo', enabled: true, badge: null, desc: 'Generate MD5, SHA-1, SHA-256 hashes' },
    { id: 'json-formatter',     name: 'JSON Formatter',     category: 'developer', path: 'tools/developer/json-formatter.html',     icon: 'fa-code',         color: 'blue',   enabled: true, badge: null, desc: 'Format, validate and beautify JSON' },
    { id: 'password-generator', name: 'Password Generator', category: 'developer', path: 'tools/developer/password-generator.html', icon: 'fa-key',          color: 'red',    enabled: true, badge: null, desc: 'Generate strong secure passwords' },

    /* ═══════ IMAGE TOOLS (From navbar dropdown) ═══════ */
    { id: 'color-picker',     name: 'Color Picker',     category: 'image', path: 'tools/image/color-picker.html',     icon: 'fa-palette',  color: 'pink',   enabled: true, badge: null, desc: 'Pick colors from any image' },
    { id: 'image-compressor', name: 'Image Compressor', category: 'image', path: 'tools/image/image-compressor.html', icon: 'fa-compress', color: 'green',  enabled: true, badge: null, desc: 'Compress images without quality loss' },
    { id: 'qr-generator',     name: 'QR Generator',     category: 'image', path: 'tools/image/qr-generator.html',     icon: 'fa-qrcode',   color: 'purple', enabled: true, badge: null, desc: 'Generate QR codes for any text or URL' },

    /* ═══════ TEXT TOOLS (From navbar dropdown) ═══════ */
    { id: 'word-counter',    name: 'Word Counter',    category: 'text', path: 'tools/text/word-counter.html',    icon: 'fa-font',        color: 'blue',   enabled: true, badge: null, desc: 'Count words, characters, paragraphs' },
    { id: 'case-converter',  name: 'Case Converter',  category: 'text', path: 'tools/text/case-converter.html',  icon: 'fa-text-height', color: 'orange', enabled: true, badge: null, desc: 'Convert text case (upper/lower/title)' },
    { id: 'lorem-generator', name: 'Lorem Ipsum',     category: 'text', path: 'tools/text/lorem-generator.html', icon: 'fa-paragraph',   color: 'purple', enabled: true, badge: null, desc: 'Generate Lorem Ipsum dummy text' },
];

const CATEGORIES = {
    'all':      { name: 'All Tools',  icon: 'fa-th-large',     color: '#7c3aed' },
    'organize': { name: 'Organize',   icon: 'fa-layer-group',  color: '#10b981' },
    'convert':  { name: 'Convert',    icon: 'fa-exchange-alt', color: '#3b82f6' },
    'edit':     { name: 'Edit',       icon: 'fa-edit',         color: '#f59e0b' },
    'security': { name: 'Security',   icon: 'fa-lock',         color: '#ef4444' },
    'ai':       { name: 'AI Tools',   icon: 'fa-robot',        color: '#ec4899' },
    'design':     { name: 'Design',     icon: 'fa-palette',      color: '#06b6d4' },
    'calculator': { name: 'Calculator', icon: 'fa-calculator',   color: '#10b981' },
    'developer':  { name: 'Developer',  icon: 'fa-code',         color: '#6366f1' },
    'image':      { name: 'Image',      icon: 'fa-image',        color: '#f97316' },
    'text':       { name: 'Text',       icon: 'fa-font',         color: '#8b5cf6' },
};

/* ════════════════════════════════════════════════
   STORAGE HELPERS — With proper sync
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
            const json = JSON.stringify(value);
            localStorage.setItem(key, json);
            // Update timestamp for change detection
            localStorage.setItem(key + '_updated', Date.now().toString());
            // Dispatch custom event for same-tab listeners
            window.dispatchEvent(new CustomEvent('admin-storage-change', { detail: { key, value } }));
            return true;
        } catch (_) { return false; }
    },
    remove(key) {
        localStorage.removeItem(key);
        localStorage.removeItem(key + '_updated');
    },

    init() {
        const existing = this.get(ADMIN_CONFIG.TOOLS_KEY, []);

        if (!existing || existing.length === 0) {
            // First time - save defaults
            this.set(ADMIN_CONFIG.TOOLS_KEY, DEFAULT_TOOLS);
        } else {
            // MERGE: Preserve enabled state, add new tools, remove deleted
            const existingMap = new Map(existing.map(t => [t.id, t]));
            const merged = DEFAULT_TOOLS.map(defaultTool => {
                const existingTool = existingMap.get(defaultTool.id);
                if (existingTool) {
                    // Keep enabled state from existing
                    return { ...defaultTool, enabled: existingTool.enabled };
                }
                return defaultTool;
            });
            this.set(ADMIN_CONFIG.TOOLS_KEY, merged);
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
        AdminStorage.remove(ADMIN_CONFIG.SESSION_KEY);
        AdminStorage.logActivity({
            type: 'logout',
            icon: 'fa-sign-out-alt',
            bg: 'bg-warning',
            title: 'Admin logged out',
            meta: 'Session ended'
        });
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

            setTimeout(() => overlay.querySelector('.modal-confirm').focus(), 150);
        });
    },

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
        if (confirmed) AdminAuth.logout();
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