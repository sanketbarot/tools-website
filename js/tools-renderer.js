/* ════════════════════════════════════════════════
   AI TOOLCOR — DYNAMIC TOOLS RENDERER
   Renders only ENABLED tools from admin config
════════════════════════════════════════════════ */

(function() {
    'use strict';

    const STORAGE_KEY = 'aitoolcor_tools_config';
    const UPDATE_KEY = 'aitoolcor_tools_config_updated';

    /* Default tools (fallback if admin config not set) */
    const DEFAULT_TOOLS = [
        // Organize
        { id: 'merge-pdf',       name: 'Merge PDF',        category: 'organize', path: 'merge-pdf.html',       icon: 'fa-object-group',        color: 'red',    enabled: true, badge: 'popular', desc: 'Combine multiple PDFs into one document easily.', keywords: 'merge pdf combine multiple files join' },
        { id: 'compress-pdf',    name: 'Compress PDF',     category: 'organize', path: 'compress-pdf.html',    icon: 'fa-compress-arrows-alt', color: 'green',  enabled: true, badge: 'popular', desc: 'Reduce PDF file size without losing original quality.', keywords: 'compress pdf reduce size smaller optimize' },
        { id: 'split-pdf',       name: 'Split PDF',        category: 'organize', path: 'split-pdf.html',       icon: 'fa-cut',                 color: 'blue',   enabled: true, badge: null,      desc: 'Extract specific pages or split PDF into multiple files.', keywords: 'split pdf extract separate pages cut' },
        { id: 'organize-pdf',    name: 'Organize PDF',     category: 'organize', path: 'organize-pdf.html',    icon: 'fa-th-large',            color: 'teal',   enabled: true, badge: null,      desc: 'Rearrange, rotate, delete, or reorder PDF pages quickly.', keywords: 'organize pdf rearrange delete reorder' },

        // Convert
        { id: 'pdf-to-jpg',      name: 'PDF to JPG',       category: 'convert',  path: 'pdf-to-jpg.html',      icon: 'fa-image',               color: 'orange', enabled: true, badge: null,      desc: 'Extract all pictures or turn PDF pages into images.', keywords: 'pdf to jpg png image convert' },
        { id: 'jpg-to-pdf',      name: 'JPG to PDF',       category: 'convert',  path: 'jpg-to-pdf.html',      icon: 'fa-image',               color: 'red',    enabled: true, badge: null,      desc: 'Convert JPG, PNG, and BMP images into a PDF file in seconds.', keywords: 'jpg png image to pdf convert' },
        { id: 'scan-to-pdf',     name: 'Scan to PDF',      category: 'convert',  path: 'scan-to-pdf.html',     icon: 'fa-camera',              color: 'pink',   enabled: true, badge: 'new',     desc: 'Turn pictures from your mobile camera directly into sharp PDFs.', keywords: 'scan camera document photo capture' },
        { id: 'pdf-to-pdfa',     name: 'PDF to PDF/A',     category: 'convert',  path: 'pdf-to-pdfa.html',     icon: 'fa-archive',             color: 'teal',   enabled: true, badge: null,      desc: 'Convert documents to PDF/A standard for long-term archiving.', keywords: 'pdf to pdfa archival iso standard' },
        { id: 'pdf-to-ico',      name: 'PDF to ICO',       category: 'convert',  path: 'pdf-to-ico.html',      icon: 'fa-file-image',          color: 'red',    enabled: true, badge: 'new',     desc: 'Convert individual PDF page blocks into .ico desktop icons.', keywords: 'pdf to ico icon favicon converter' },
        { id: 'jpg-to-ico',      name: 'JPG to ICO',       category: 'convert',  path: 'jpg-to-ico.html',      icon: 'fa-image',               color: 'orange', enabled: true, badge: 'new',     desc: 'Convert any PNG or JPG photo into custom website favicons.', keywords: 'jpg png image to ico icon favicon' },
        { id: 'jpg-to-png',      name: 'JPG to PNG',       category: 'convert',  path: 'jpg-to-png.html',      icon: 'fa-image',               color: 'purple', enabled: true, badge: 'new',     desc: 'Convert JPG images to PNG format with transparency support.', keywords: 'jpg to png image convert transparent' },
        { id: 'pdf-to-word',     name: 'PDF to Word',      category: 'convert',  path: 'pdf-to-word.html',     icon: 'fa-file-word',           color: 'blue',   enabled: false, badge: 'soon',    desc: 'Convert PDF files to editable Word documents instantly.', keywords: 'pdf to word doc docx convert editable' },
        { id: 'word-to-pdf',     name: 'Word to PDF',      category: 'convert',  path: 'word-to-pdf.html',     icon: 'fa-file-word',           color: 'blue',   enabled: false, badge: 'soon',    desc: 'Convert Word documents to high-quality PDF files easily.', keywords: 'word to pdf doc docx convert' },
        { id: 'pdf-to-excel',    name: 'PDF to Excel',     category: 'convert',  path: 'pdf-to-excel.html',    icon: 'fa-file-excel',          color: 'green',  enabled: false, badge: 'soon',    desc: 'Extract tables from PDFs and convert them to Excel spreadsheets.', keywords: 'pdf to excel xls xlsx tables spreadsheet' },
        { id: 'ppt-to-pdf',      name: 'PPT to PDF',       category: 'convert',  path: 'ppt-to-pdf.html',      icon: 'fa-file-powerpoint',     color: 'orange', enabled: false, badge: 'soon',    desc: 'Convert PowerPoint presentations to professional PDF files.', keywords: 'ppt powerpoint to pdf presentation slides' },

        // Edit
        { id: 'edit-pdf',        name: 'Edit PDF',         category: 'edit',     path: 'edit-pdf.html',        icon: 'fa-edit',                color: 'purple', enabled: false, badge: 'soon',    desc: 'Edit text, images, and links directly in your PDF documents.', keywords: 'edit pdf text image links modify' },
        { id: 'sign-pdf',        name: 'Sign PDF',         category: 'edit',     path: 'sign-pdf.html',        icon: 'fa-signature',           color: 'purple', enabled: true, badge: null,      desc: 'Draw, type, or upload your signature to sign documents.', keywords: 'sign pdf signature draw type digital' },
        { id: 'watermark',       name: 'Watermark',        category: 'edit',     path: 'watermark.html',       icon: 'fa-tint',                color: 'teal',   enabled: true, badge: null,      desc: 'Add custom text or image stamps over your PDF pages.', keywords: 'watermark pdf text image stamp' },
        { id: 'redact-pdf',      name: 'Redact PDF',       category: 'edit',     path: 'redact-pdf.html',      icon: 'fa-eraser',              color: 'red',    enabled: true, badge: null,      desc: 'Permanently black out and remove sensitive content from PDFs.', keywords: 'redact black out sensitive remove hide' },
        { id: 'rotate-pdf',      name: 'Rotate PDF',       category: 'edit',     path: 'rotate-pdf.html',      icon: 'fa-arrows-rotate',       color: 'orange', enabled: true, badge: null,      desc: 'Turn pages of your PDF to landscape or portrait mode.', keywords: 'rotate pdf turn flip orientation' },
        { id: 'crop-pdf',        name: 'Crop PDF',         category: 'edit',     path: 'crop-pdf.html',        icon: 'fa-crop-alt',            color: 'purple', enabled: true, badge: null,      desc: 'Trim the outer margins or crop a specific area in PDFs.', keywords: 'crop pdf trim margins resize' },
        { id: 'page-numbers',    name: 'Page Numbers',     category: 'edit',     path: 'page-numbers.html',    icon: 'fa-list-ol',             color: 'blue',   enabled: true, badge: null,      desc: 'Insert dynamic page numbering into headers or footers.', keywords: 'page numbers insert footer header' },
        { id: 'pdf-forms',       name: 'PDF Forms',        category: 'edit',     path: 'pdf-forms.html',       icon: 'fa-edit',                color: 'blue',   enabled: true, badge: null,      desc: 'Fill out interactive forms or build new templates in PDFs.', keywords: 'pdf forms fill fields template' },
        { id: 'repair-pdf',      name: 'Repair PDF',       category: 'edit',     path: 'repair-pdf.html',      icon: 'fa-tools',               color: 'orange', enabled: true, badge: null,      desc: 'Fix corrupted, damaged, or unreadable PDF documents.', keywords: 'repair pdf fix corrupted damaged' },
        { id: 'compare-pdf',     name: 'Compare PDF',      category: 'edit',     path: 'compare-pdf.html',     icon: 'fa-not-equal',           color: 'purple', enabled: true, badge: null,      desc: 'Compare two versions of a PDF side-by-side.', keywords: 'compare pdf diff differences side' },
        { id: 'crop-jpg',        name: 'Crop JPG',         category: 'edit',     path: 'crop-jpg.html',        icon: 'fa-crop-alt',            color: 'purple', enabled: true, badge: null,      desc: 'Trim dimensions or crop multiple photo assets in batch.', keywords: 'crop jpg image batch resize' },
        { id: 'corrupt-pdf',     name: 'Corrupt PDF',      category: 'edit',     path: 'corrupt-pdf.html',     icon: 'fa-virus',               color: 'red',    enabled: true, badge: null,      desc: 'Intentionally break a PDF file to test system QA states.', keywords: 'corrupt pdf damage break test' },

        // Security
        { id: 'unlock-pdf',      name: 'Unlock PDF',       category: 'security', path: 'unlock-pdf.html',      icon: 'fa-lock-open',           color: 'green',  enabled: true, badge: null,      desc: 'Remove passwords and restrictions from secured PDF files.', keywords: 'unlock remove password decrypt' },
        { id: 'protect-pdf',     name: 'Protect PDF',      category: 'security', path: 'protect-pdf.html',     icon: 'fa-shield-alt',          color: 'red',    enabled: true, badge: null,      desc: 'Add strong encryption and custom passwords to PDFs.', keywords: 'protect password encrypt lock' },

        // AI
        { id: 'ocr-pdf',         name: 'OCR PDF',          category: 'ai',       path: 'ocr-pdf.html',         icon: 'fa-eye',                 color: 'purple', enabled: true, badge: 'ai',      desc: 'Convert scanned PDFs or images into searchable, editable text.', keywords: 'ocr pdf text extract scanned recognition' },
        { id: 'font-identifier', name: 'Font Identifier',  category: 'ai',       path: 'font-identifier.html', icon: 'fa-font',                color: 'indigo', enabled: true, badge: 'ai',      desc: 'Find out the name of any font from an image instantly.', keywords: 'font identifier find name image detector' },
        { id: 'translate-pdf',   name: 'Translate PDF',    category: 'ai',       path: 'translate-pdf.html',   icon: 'fa-language',            color: 'pink',   enabled: false, badge: 'soon',    desc: 'Translate PDF documents into 100+ languages with AI.', keywords: 'translate pdf language multilingual ai' },
    ];

    /* ─────── STORAGE HELPERS ─────── */
    function getTools() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Merge with defaults to get latest desc/keywords
                    const storedMap = new Map(parsed.map(t => [t.id, t]));
                    return DEFAULT_TOOLS.map(def => {
                        const stored = storedMap.get(def.id);
                        return stored ? { ...def, enabled: stored.enabled } : def;
                    });
                }
            }
        } catch (_) {}
        return DEFAULT_TOOLS;
    }

    /* ─────── RENDER TOOL CARD ─────── */
    function renderToolCard(tool) {
        const badge = tool.badge ? 
            `<span class="badge badge-${tool.badge}" aria-label="${tool.badge}">${tool.badge.charAt(0).toUpperCase() + tool.badge.slice(1)}</span>` : '';
        
        const isSoon = tool.badge === 'soon';
        const hrefAttr = isSoon ? 'javascript:void(0)' : tool.path;
        const clickHandler = isSoon ? 'onclick="showSoonNotification(\'' + tool.name.replace(/'/g, "\\'") + '\')"' : '';

        return `
            <a href="${hrefAttr}" class="tool-card glass ${isSoon ? 'tool-soon' : ''}"
               role="listitem"
               data-tool-id="${tool.id}"
               data-category="${tool.category}"
               data-name="${tool.keywords || tool.name.toLowerCase()}"
               aria-label="${tool.name} - ${tool.desc}"
               ${clickHandler}>
                ${badge}
                <div class="tool-icon icon-${tool.color}" aria-hidden="true">
                    <i class="fas ${tool.icon}"></i>
                </div>
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
                <div class="tool-arrow" aria-hidden="true">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </a>
        `;
    }

    /* ─────── RENDER TOOLS GRID ─────── */
    function renderTools() {
        const grid = document.getElementById('toolsGrid');
        if (!grid) return;

        const tools = getTools();
        // Show only ENABLED tools on index page
        const visibleTools = tools.filter(t => t.enabled);

        if (visibleTools.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-light);">
                    <i class="fas fa-tools" style="font-size:60px;opacity:0.3;margin-bottom:16px;display:block;"></i>
                    <h3 style="font-size:20px;margin-bottom:8px;color:var(--text-dark);">No tools available</h3>
                    <p>All tools are currently disabled. Please check back later.</p>
                </div>
            `;
            return;
        }

        // Sort by category order + popular/new first
        const categoryOrder = { organize: 1, convert: 2, edit: 3, security: 4, ai: 5 };
        const badgeOrder = { popular: 1, new: 2, ai: 3, soon: 4 };

        visibleTools.sort((a, b) => {
            const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
            if (catDiff !== 0) return catDiff;
            return (badgeOrder[a.badge] || 99) - (badgeOrder[b.badge] || 99);
        });

        grid.innerHTML = visibleTools.map(renderToolCard).join('');

        // Update tool count if shown
        const enabledCount = visibleTools.length;
        document.querySelectorAll('[data-tools-count]').forEach(el => {
            el.textContent = enabledCount + '+';
        });

        console.log(`✅ Rendered ${visibleTools.length} active tools`);
    }

    /* ─────── COMING SOON NOTIFICATION ─────── */
    window.showSoonNotification = function(toolName) {
        document.querySelector('.soon-notification')?.remove();

        const notif = document.createElement('div');
        notif.className = 'soon-notification';
        notif.innerHTML = `
            <div class="soon-notif-box">
                <button class="soon-notif-close" type="button" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="soon-notif-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3>Coming Soon! 🚀</h3>
                <p><strong>${toolName}</strong> is currently under development.</p>
                <p class="soon-notif-sub">We're working hard to bring this tool to you. Stay tuned!</p>
                <button class="soon-notif-btn" type="button">
                    <i class="fas fa-check"></i> Got it
                </button>
            </div>
        `;
        document.body.appendChild(notif);

        requestAnimationFrame(() => notif.classList.add('show'));

        const close = () => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        };

        notif.querySelector('.soon-notif-close').onclick = close;
        notif.querySelector('.soon-notif-btn').onclick = close;
        notif.onclick = (e) => { if (e.target === notif) close(); };

        setTimeout(close, 6000);
    };

    /* ─────── LIVE SYNC ─────── */
    let lastUpdate = localStorage.getItem(UPDATE_KEY) || '0';

    function checkUpdates() {
        const current = localStorage.getItem(UPDATE_KEY) || '0';
        if (current !== lastUpdate) {
            lastUpdate = current;
            console.log('🔄 Tools updated, re-rendering...');
            renderTools();
        }
    }

    /* Listen for changes from admin panel */
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === UPDATE_KEY) {
            checkUpdates();
        }
    });

    /* ─────── INIT ─────── */
    function init() {
        renderTools();
        // Check for updates every 2 seconds
        setInterval(checkUpdates, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();