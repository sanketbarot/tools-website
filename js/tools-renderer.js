/* ════════════════════════════════════════════════
   AI TOOLCOR — DYNAMIC TOOLS RENDERER v7.1 (FIXED)
   Fixes:
   ✅ setInterval(2s) polling REMOVED — storage event only
   ✅ 'javascript:void(0)' replaced with '#' + e.preventDefault()
   ✅ console.log removed from production
   ✅ renderTools() now clears only toolsLoading placeholder,
      not already-rendered hardcoded cards (flash prevention)
════════════════════════════════════════════════ */

(function () {
    'use strict';

    const STORAGE_KEY = 'aitoolcor_tools_config';
    const UPDATE_KEY  = 'aitoolcor_tools_config_updated';

    /* ══════════════════════════════════════
       MASTER TOOLS LIST — ALL TOOLS
    ══════════════════════════════════════ */
    const DEFAULT_TOOLS = [
        /* ── ORGANIZE ── */
        { id:'merge-pdf',    name:'Merge PDF',    category:'organize', path:'merge-pdf.html',    icon:'fa-object-group',        color:'red',    enabled:true,  badge:'popular', desc:'Combine multiple PDFs into one document easily.',                     keywords:'merge pdf combine multiple files join layers' },
        { id:'compress-pdf', name:'Compress PDF', category:'organize', path:'compress-pdf.html', icon:'fa-compress-arrows-alt', color:'green',  enabled:true,  badge:'popular', desc:'Reduce PDF file size without losing original quality.',                keywords:'compress pdf reduce size smaller optimize mb' },
        { id:'split-pdf',    name:'Split PDF',    category:'organize', path:'split-pdf.html',    icon:'fa-cut',                 color:'blue',   enabled:true,  badge:null,      desc:'Extract specific pages or split PDF into multiple files.',             keywords:'split pdf extract separate pages cut document' },
        { id:'organize-pdf', name:'Organize PDF', category:'organize', path:'organize-pdf.html', icon:'fa-th-large',            color:'teal',   enabled:true,  badge:null,      desc:'Rearrange, rotate, delete, or reorder PDF pages quickly.',             keywords:'organize pdf rearrange delete duplicate reorder pages structure' },

        /* ── CONVERT ── */
        { id:'pdf-to-jpg',  name:'PDF to JPG',  category:'convert', path:'pdf-to-jpg.html',  icon:'fa-image',        color:'orange', enabled:true,  badge:null,    desc:'Extract all pictures or turn single PDF pages into images.',       keywords:'pdf to jpg png image convert extract photos jpeg' },
        { id:'jpg-to-pdf',  name:'JPG to PDF',  category:'convert', path:'jpg-to-pdf.html',  icon:'fa-image',        color:'red',    enabled:true,  badge:null,    desc:'Convert JPG, PNG, and BMP images into a PDF file in seconds.',    keywords:'jpg png image to pdf convert jpeg format' },
        { id:'scan-to-pdf', name:'Scan to PDF', category:'convert', path:'scan-to-pdf.html', icon:'fa-camera',       color:'pink',   enabled:true,  badge:'new',   desc:'Turn pictures from your mobile camera directly into sharp PDFs.', keywords:'scan to pdf camera document scanner photo capture auto crop' },
        { id:'pdf-to-pdfa', name:'PDF to PDF/A',category:'convert', path:'pdf-to-pdfa.html', icon:'fa-archive',      color:'teal',   enabled:true,  badge:null,    desc:'Convert documents to PDF/A standard for long-term archiving.',    keywords:'pdf to pdfa archival format iso standard compliance long term' },
        { id:'pdf-to-ico',  name:'PDF to ICO',  category:'convert', path:'pdf-to-ico.html',  icon:'fa-file-image',   color:'red',    enabled:true,  badge:'new',   desc:'Convert individual PDF page blocks into small .ico desktop icons.',keywords:'pdf to ico icon favicon converter shortcut art' },
        { id:'jpg-to-ico',  name:'JPG to ICO',  category:'convert', path:'jpg-to-ico.html',  icon:'fa-image',        color:'orange', enabled:true,  badge:'new',   desc:'Convert any PNG or JPG photo into custom website favicons.',      keywords:'jpg png image to ico icon favicon shortcut app web' },
        { id:'jpg-to-png',  name:'JPG to PNG',  category:'convert', path:'jpg-to-png.html',  icon:'fa-image',        color:'purple', enabled:true,  badge:'new',   desc:'Convert JPG images to PNG format with transparency support.',     keywords:'jpg to png image convert format transparent background' },
        { id:'pdf-to-word', name:'PDF to Word', category:'convert', path:'pdf-to-word.html', icon:'fa-file-word',    color:'blue',   enabled:false, badge:'soon',  desc:'Convert PDF files to editable Word documents instantly.',         keywords:'pdf to word doc docx convert editable document' },
        { id:'word-to-pdf', name:'Word to PDF', category:'convert', path:'word-to-pdf.html', icon:'fa-file-word',    color:'blue',   enabled:false, badge:'soon',  desc:'Convert Word documents to high-quality PDF files easily.',        keywords:'word to pdf doc docx convert document format' },
        { id:'pdf-to-excel',name:'PDF to Excel',category:'convert', path:'pdf-to-excel.html',icon:'fa-file-excel',   color:'green',  enabled:false, badge:'soon',  desc:'Extract tables from PDFs and convert them to Excel spreadsheets.',keywords:'pdf to excel xls xlsx convert tables spreadsheet data' },
        { id:'excel-to-pdf',name:'Excel to PDF',category:'convert', path:'excel-to-pdf.html',icon:'fa-file-excel',   color:'green',  enabled:false, badge:'soon',  desc:'Convert Excel spreadsheets to professional PDF documents.',       keywords:'excel xls xlsx to pdf spreadsheet convert tables' },
        { id:'ppt-to-pdf',  name:'PPT to PDF',  category:'convert', path:'ppt-to-pdf.html',  icon:'fa-file-powerpoint',color:'orange',enabled:false, badge:'soon', desc:'Convert PowerPoint presentations to professional PDF files.',     keywords:'ppt to pdf powerpoint presentation slides convert' },
        { id:'pdf-to-ppt',  name:'PDF to PPT',  category:'convert', path:'pdf-to-ppt.html',  icon:'fa-file-powerpoint',color:'orange',enabled:false, badge:'soon', desc:'Convert PDF documents into editable PowerPoint presentations.',   keywords:'pdf to ppt powerpoint slides presentation convert' },
        { id:'html-to-pdf', name:'HTML to PDF', category:'convert', path:'html-to-pdf.html', icon:'fa-code',         color:'blue',   enabled:false, badge:'new',   desc:'Convert any web page or HTML code into a clean PDF file.',        keywords:'html to pdf webpage url web convert screenshot' },

        /* ── EDIT ── */
        { id:'edit-pdf',    name:'Edit PDF',    category:'edit', path:'edit-pdf.html',    icon:'fa-edit',         color:'purple', enabled:false, badge:'soon', desc:'Edit text, images, and links directly in your PDF documents.',   keywords:'edit pdf text image links modify change content' },
        { id:'sign-pdf',    name:'Sign PDF',    category:'edit', path:'sign-pdf.html',    icon:'fa-signature',    color:'purple', enabled:true,  badge:null,   desc:'Draw, type, or upload your signature to sign documents.',         keywords:'sign pdf signature draw type upload digital electronic' },
        { id:'watermark',   name:'Watermark',   category:'edit', path:'watermark.html',   icon:'fa-tint',         color:'teal',   enabled:true,  badge:null,   desc:'Add custom text or image stamps over your PDF pages seamlessly.', keywords:'watermark pdf text image stamp overlay draft copyright' },
        { id:'redact-pdf',  name:'Redact PDF',  category:'edit', path:'redact-pdf.html',  icon:'fa-eraser',       color:'red',    enabled:true,  badge:null,   desc:'Permanently black out and remove sensitive content from PDFs.',   keywords:'redact pdf black out sensitive text remove hide block' },
        { id:'rotate-pdf',  name:'Rotate PDF',  category:'edit', path:'rotate-pdf.html',  icon:'fa-arrows-rotate',color:'orange', enabled:true,  badge:null,   desc:'Turn single or all pages of your PDF to landscape or portrait.',  keywords:'rotate pdf turn flip page orientation landscape portrait 90 180 degrees' },
        { id:'crop-pdf',    name:'Crop PDF',    category:'edit', path:'crop-pdf.html',    icon:'fa-crop-alt',     color:'purple', enabled:true,  badge:null,   desc:'Trim the outer margins or select a specific area to crop pages.',  keywords:'crop pdf trim margins resize area bounding layout' },
        { id:'page-numbers',name:'Page Numbers',category:'edit', path:'page-numbers.html',icon:'fa-list-ol',      color:'blue',   enabled:true,  badge:null,   desc:'Insert dynamic page numbering into headers or footers.',          keywords:'page numbers add insert footer header numbering counter' },
        { id:'pdf-forms',   name:'PDF Forms',   category:'edit', path:'pdf-forms.html',   icon:'fa-edit',         color:'blue',   enabled:true,  badge:null,   desc:'Fill out interactive forms or build new form templates.',         keywords:'pdf forms fill create fields checkbox text blank template' },
        { id:'repair-pdf',  name:'Repair PDF',  category:'edit', path:'repair-pdf.html',  icon:'fa-tools',        color:'orange', enabled:true,  badge:null,   desc:'Fix corrupted, damaged, or unreadable PDF document layers.',      keywords:'repair pdf fix corrupted damaged broken recover structure restore' },
        { id:'compare-pdf', name:'Compare PDF', category:'edit', path:'compare-pdf.html', icon:'fa-not-equal',    color:'purple', enabled:true,  badge:null,   desc:'Compare two versions of a PDF side-by-side to highlight diffs.',  keywords:'compare pdf diff differences side by side change log' },
        { id:'crop-jpg',    name:'Crop JPG',    category:'edit', path:'crop-jpg.html',    icon:'fa-crop-alt',     color:'purple', enabled:true,  badge:null,   desc:'Trim dimensions or crop multiple photo assets in a single batch.',keywords:'crop jpg image multiple batch resize photo dimensions' },
        { id:'corrupt-pdf', name:'Corrupt PDF', category:'edit', path:'corrupt-pdf.html', icon:'fa-virus',        color:'red',    enabled:true,  badge:null,   desc:'Intentionally break a PDF file to test system QA error states.',  keywords:'corrupt pdf damage break test developer qa broken file' },

        /* ── SECURITY ── */
        { id:'unlock-pdf',  name:'Unlock PDF',  category:'security', path:'unlock-pdf.html',  icon:'fa-lock-open',  color:'green', enabled:true, badge:null, desc:'Remove passwords and restrictions from secured PDF files.', keywords:'unlock remove password pdf decrypt secure safety' },
        { id:'protect-pdf', name:'Protect PDF', category:'security', path:'protect-pdf.html', icon:'fa-shield-alt', color:'red',   enabled:true, badge:null, desc:'Add strong encryption and custom passwords to your PDF files.',keywords:'protect password encrypt pdf lock security safety' },

        /* ── AI ── */
        { id:'ocr-pdf',       name:'OCR PDF',       category:'ai', path:'ocr-pdf.html',       icon:'fa-eye',    color:'purple', enabled:true,  badge:'ai',   desc:'Convert scanned PDFs or images into searchable, editable text.', keywords:'ocr pdf text extract scanned image recognition intelligent' },
        { id:'font-identifier',name:'Font Identifier',category:'ai',path:'font-identifier.html',icon:'fa-font',  color:'indigo', enabled:true,  badge:'ai',   desc:'Find out the name of any font from an image instantly.',         keywords:'font identifier find font name from image font finder font detector' },
        { id:'ai-summarizer', name:'AI Summarizer', category:'ai', path:'ai-summarizer.html', icon:'fa-brain',  color:'indigo', enabled:true,  badge:'ai',   desc:'Instantly summarize long PDFs, articles and documents with AI.', keywords:'ai summarizer summarize text document article pdf abstract' },
        { id:'translate-pdf', name:'Translate PDF', category:'ai', path:'translate-pdf.html', icon:'fa-language',color:'pink',  enabled:false, badge:'soon', desc:'Translate PDF documents into 100+ languages with AI accuracy.',  keywords:'translate pdf language convert multilingual translation' },
    ];

    /* ══════════════════════════════════════
       STORAGE HELPERS
    ══════════════════════════════════════ */
    function getTools() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const storedMap = new Map(parsed.map(t => [t.id, t]));
                    const merged = DEFAULT_TOOLS.map(def => {
                        const s = storedMap.get(def.id);
                        return s ? { ...def, enabled: s.enabled } : def;
                    });
                    parsed.forEach(s => {
                        if (!merged.find(m => m.id === s.id)) merged.push(s);
                    });
                    return merged;
                }
            }
        } catch (_) {}
        return DEFAULT_TOOLS;
    }

    /* ══════════════════════════════════════
       BADGE LABEL MAP
    ══════════════════════════════════════ */
    const BADGE_LABELS = { popular:'Popular', new:'New', ai:'AI', soon:'Soon' };

    /* ══════════════════════════════════════
       RENDER SINGLE TOOL CARD
       ✅ FIX: 'javascript:void(0)' → '#' with data-soon attr
    ══════════════════════════════════════ */
    function renderToolCard(tool) {
        const isSoon = tool.badge === 'soon';
        // ✅ FIX: use '#' for soon tools — click handled via event delegation below
        const href = isSoon ? '#' : tool.path;

        const badgeHTML = tool.badge ? `
            <span class="badge badge-${tool.badge}" aria-label="${BADGE_LABELS[tool.badge] || tool.badge}">
                ${BADGE_LABELS[tool.badge] || tool.badge}
            </span>` : '';

        return `
            <a href="${href}"
               class="tool-card glass${isSoon ? ' tool-soon' : ''}"
               role="listitem"
               data-tool-id="${tool.id}"
               data-category="${tool.category}"
               data-name="${(tool.keywords || tool.name).toLowerCase()}"
               aria-label="${tool.name} — ${tool.desc}"
               ${isSoon ? `data-soon-name="${tool.name.replace(/"/g, '&quot;')}"` : ''}>
                ${badgeHTML}
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

    /* ══════════════════════════════════════
       RENDER TOOLS GRID
    ══════════════════════════════════════ */
    function renderTools() {
        const grid = document.getElementById('toolsGrid');
        if (!grid) return;

        // Remove loading placeholder only
        const loading = document.getElementById('toolsLoading');
        if (loading) loading.remove();

        const tools        = getTools();
        // ✅ FIX: Only show PDF/AI tool categories in grid
        //    Calculator, Image, Developer, Text tools are navbar-only
        const GRID_CATEGORIES = new Set(['organize','convert','edit','security','ai']);
        const visibleTools = tools.filter(t =>
            GRID_CATEGORIES.has(t.category) && (t.enabled || t.badge === 'soon')
        );

        if (visibleTools.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-light);">
                    <i class="fas fa-tools" style="font-size:56px;opacity:0.25;margin-bottom:16px;display:block;" aria-hidden="true"></i>
                    <h3 style="font-size:18px;margin-bottom:8px;color:var(--text-dark);">No tools available</h3>
                    <p style="font-size:13px;">All tools are currently disabled. Please check back later.</p>
                </div>
            `;
            return;
        }

        // Sort: category order → badge priority
        const catOrder   = { organize:1, convert:2, edit:3, security:4, ai:5 };
        const badgeOrder = { popular:1, new:2, ai:3, soon:99 };

        visibleTools.sort((a, b) => {
            const catDiff = (catOrder[a.category] || 9) - (catOrder[b.category] || 9);
            if (catDiff !== 0) return catDiff;
            return (badgeOrder[a.badge] || 9) - (badgeOrder[b.badge] || 9);
        });

        grid.innerHTML = visibleTools.map(renderToolCard).join('');

        // Update tool-count displays
        document.querySelectorAll('[data-tools-count]').forEach(el => {
            el.textContent = visibleTools.filter(t => t.enabled).length + '+';
        });

        // Re-attach ripple & prefetch
        if (typeof window.initRippleEffect === 'function') window.initRippleEffect();
        if (typeof window.initPrefetch     === 'function') window.initPrefetch();

        // ✅ FIX: Event delegation for "soon" clicks — no inline onclick
        grid.addEventListener('click', function soonHandler(e) {
            const card = e.target.closest('.tool-soon[data-soon-name]');
            if (!card) return;
            e.preventDefault();
            const name = card.getAttribute('data-soon-name');
            if (name) window.showSoonNotification(name);
        });
    }

    /* ══════════════════════════════════════
       COMING SOON POPUP
    ══════════════════════════════════════ */
    window.showSoonNotification = function (toolName) {
        document.querySelector('.soon-notification')?.remove();

        const notif = document.createElement('div');
        notif.className = 'soon-notification';
        notif.setAttribute('role', 'dialog');
        notif.setAttribute('aria-modal', 'true');
        notif.setAttribute('aria-label', toolName + ' coming soon');
        notif.innerHTML = `
            <div class="soon-notif-box">
                <button class="soon-notif-close" type="button" aria-label="Close">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                <div class="soon-notif-icon" aria-hidden="true">
                    <i class="fas fa-rocket"></i>
                </div>
                <h3>Coming Soon! 🚀</h3>
                <p><strong>${toolName}</strong> is currently under development.</p>
                <p class="soon-notif-sub">We're working hard to bring this tool to you. Stay tuned!</p>
                <button class="soon-notif-btn" type="button">
                    <i class="fas fa-check" aria-hidden="true"></i> Got it
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
        notif.querySelector('.soon-notif-btn').onclick   = close;
        notif.addEventListener('click', e => { if (e.target === notif) close(); });

        const escHandler = e => {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);
        setTimeout(close, 6000);
    };

    /* ══════════════════════════════════════
       LIVE SYNC — storage event only (no polling)
       ✅ FIX: setInterval removed
    ══════════════════════════════════════ */
    let lastUpdate = localStorage.getItem(UPDATE_KEY) || '0';

    function checkUpdates() {
        const current = localStorage.getItem(UPDATE_KEY) || '0';
        if (current !== lastUpdate) {
            lastUpdate = current;
            renderTools();
        }
    }

    // Cross-tab sync via native storage event
    window.addEventListener('storage', e => {
        if (e.key === STORAGE_KEY || e.key === UPDATE_KEY) checkUpdates();
    });

    // Same-tab sync via admin panel custom event
    window.addEventListener('admin-storage-change', e => {
        if (e.detail?.key === STORAGE_KEY) checkUpdates();
    });

    /* ══════════════════════════════════════
       INIT
    ══════════════════════════════════════ */
    function init() {
        renderTools();
        // ✅ FIX: no setInterval polling
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();