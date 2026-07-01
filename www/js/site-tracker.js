/* ════════════════════════════════════════════════
   AI TOOLCOR — UNIVERSAL SITE TRACKER
   Fast live sync with admin panel (2 sec polling)
════════════════════════════════════════════════ */

(function() {
    'use strict';

    const KEYS = {
        TOOLS: 'aitoolcor_tools_config',
        ANALYTICS: 'aitoolcor_analytics',
        ACTIVITY: 'aitoolcor_activity_log',
        TOOLS_UPDATED: 'aitoolcor_tools_config_updated'
    };

    let lastToolsUpdate = '0';

    /* ─────── STORAGE HELPERS ─────── */
    function getData(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch(_) { return fallback; }
    }

    function setData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch(_) { return false; }
    }

    /* ─────── DETECT CURRENT TOOL ─────── */
    function getCurrentToolId() {
        // Get filename from path
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');

        // Match against tools by ID or by full path
        const tools = getData(KEYS.TOOLS, []);

        // Try exact match first
        let tool = tools.find(t => t.id === filename);
        if (tool) return tool.id;

        // Try matching by full path (for subfolder tools)
        const fullPath = path.replace(/^\//, '').replace(/^\.\//, '');
        tool = tools.find(t => t.path === fullPath || t.path.endsWith('/' + filename + '.html'));
        if (tool) return tool.id;

        // Homepage detection
        if (!filename || filename === 'index' || filename === '') return null;

        return filename; // fallback
    }

    /* ─────── TRACK PAGE VISIT ─────── */
    function trackVisit() {
        const analytics = getData(KEYS.ANALYTICS, {
            totalVisits: 0,
            totalFiles: 0,
            toolUsage: {},
            dailyVisits: {},
            firstVisit: Date.now()
        });

        analytics.totalVisits = (analytics.totalVisits || 0) + 1;

        const today = new Date().toISOString().split('T')[0];
        analytics.dailyVisits = analytics.dailyVisits || {};
        analytics.dailyVisits[today] = (analytics.dailyVisits[today] || 0) + 1;

        const toolId = getCurrentToolId();
        if (toolId) {
            analytics.toolUsage = analytics.toolUsage || {};
            analytics.toolUsage[toolId] = (analytics.toolUsage[toolId] || 0) + 1;
        }

        if (!analytics.firstVisit) analytics.firstVisit = Date.now();
        setData(KEYS.ANALYTICS, analytics);

        const tools = getData(KEYS.TOOLS, []);
        if (toolId) {
            const tool = tools.find(t => t.id === toolId);
            if (tool) {
                logActivity({
                    icon: tool.icon || 'fa-eye',
                    bg: 'bg-primary',
                    title: `Tool visited: ${tool.name}`,
                    meta: `Total uses: ${analytics.toolUsage[toolId]}`
                });
            }
        } else {
            logActivity({
                icon: 'fa-home',
                bg: 'bg-info',
                title: 'Homepage visit',
                meta: `Visits today: ${analytics.dailyVisits[today]}`
            });
        }
    }

    /* ─────── TRACK FILE PROCESSED ─────── */
    window.trackFileProcessed = function(toolId, fileCount = 1) {
        const analytics = getData(KEYS.ANALYTICS, {});
        analytics.totalFiles = (analytics.totalFiles || 0) + fileCount;
        setData(KEYS.ANALYTICS, analytics);

        const tools = getData(KEYS.TOOLS, []);
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            logActivity({
                icon: 'fa-file-check',
                bg: 'bg-success',
                title: `File${fileCount > 1 ? 's' : ''} processed`,
                meta: `${tool.name} · ${fileCount} file${fileCount > 1 ? 's' : ''}`
            });
        }
    };

    /* ─────── ACTIVITY LOG ─────── */
    function logActivity(activity) {
        const logs = getData(KEYS.ACTIVITY, []);
        logs.unshift({
            ...activity,
            id: Date.now() + Math.random(),
            time: Date.now()
        });
        setData(KEYS.ACTIVITY, logs.slice(0, 100));
    }

    /* ─────── HIDE DISABLED TOOLS (Homepage) ─────── */
    function hideDisabledTools() {
        const tools = getData(KEYS.TOOLS, []);
        if (!tools.length) return;

        const disabledIds = new Set(tools.filter(t => !t.enabled).map(t => t.id));
        const enabledIds  = new Set(tools.filter(t => t.enabled).map(t => t.id));

        // Hide tool cards
        document.querySelectorAll('.tool-card, [data-tool-id]').forEach(card => {
            let toolId = card.getAttribute('data-tool-id');

            if (!toolId) {
                const href = card.getAttribute('href') || '';
                toolId = href.replace('.html', '').replace(/^\.?\//, '').split('/').pop();
            }

            if (disabledIds.has(toolId)) {
                card.style.display = 'none';
            } else if (enabledIds.has(toolId)) {
                card.style.display = '';
            }
        });

        // Hide nav dropdown items too
        document.querySelectorAll('.ndrop-menu a, .nav-links a').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (!href || href === '#' || href.startsWith('http')) return;

            const filename = href.replace('.html', '').split('/').pop();
            if (disabledIds.has(filename)) {
                link.style.display = 'none';
            } else if (enabledIds.has(filename)) {
                link.style.display = '';
            }
        });

        // Update visible count if shown
        const visibleCount = document.querySelectorAll('.tool-card:not([style*="none"])').length;
        document.querySelectorAll('[data-tools-count]').forEach(el => {
            el.textContent = visibleCount + '+';
        });
    }

    /* ─────── CHECK IF CURRENT TOOL IS DISABLED ─────── */
    function checkToolStatus() {
        const toolId = getCurrentToolId();
        if (!toolId) return;

        const tools = getData(KEYS.TOOLS, []);
        const tool = tools.find(t => t.id === toolId);

        if (tool && !tool.enabled) {
            showDisabledPage(tool);
        }
    }

    /* ─────── SHOW DISABLED TOOL PAGE ─────── */
    function showDisabledPage(tool) {
        if (document.getElementById('aitoolcor-disabled-overlay')) return; // already shown

        const overlay = document.createElement('div');
        overlay.id = 'aitoolcor-disabled-overlay';
        overlay.innerHTML = `
            <div style="
                position:fixed;inset:0;
                background:linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95);
                display:flex;align-items:center;justify-content:center;
                color:#fff;text-align:center;padding:20px;
                font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
                z-index:99999;">
                <div style="max-width:520px;animation:aitoolcorFadeUp 0.6s ease;">
                    <div style="font-size:90px;margin-bottom:20px;animation:aitoolcorBounce 2s infinite;">🔧</div>
                    <h1 style="font-size:34px;font-weight:800;margin-bottom:14px;line-height:1.2;">
                        Tool Under Maintenance
                    </h1>
                    <p style="font-size:16px;opacity:0.85;margin-bottom:8px;line-height:1.6;">
                        <strong style="color:#a78bfa;">${tool.name}</strong> is currently disabled.
                    </p>
                    <p style="font-size:14px;opacity:0.7;margin-bottom:32px;line-height:1.6;">
                        We're working on improvements. Please check back later or explore our other tools.
                    </p>
                    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                        <a href="/" style="
                            display:inline-flex;align-items:center;gap:8px;
                            background:linear-gradient(135deg,#7c3aed,#ec4899);
                            color:#fff;padding:14px 28px;
                            border-radius:50px;text-decoration:none;
                            font-weight:700;font-size:14px;
                            box-shadow:0 8px 24px rgba(124,58,237,0.4);">
                            <i class="fas fa-home"></i> Back to Home
                        </a>
                        <a href="/#tools" style="
                            display:inline-flex;align-items:center;gap:8px;
                            background:rgba(255,255,255,0.1);
                            color:#fff;padding:14px 28px;
                            border-radius:50px;text-decoration:none;
                            font-weight:700;font-size:14px;
                            border:1.5px solid rgba(255,255,255,0.2);">
                            <i class="fas fa-th"></i> Browse Tools
                        </a>
                    </div>
                </div>
                <style>
                    @keyframes aitoolcorFadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes aitoolcorBounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }
                </style>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /* ─────── REMOVE DISABLED OVERLAY (if re-enabled) ─────── */
    function removeDisabledOverlay() {
        const overlay = document.getElementById('aitoolcor-disabled-overlay');
        if (overlay) overlay.remove();
    }

    /* ─────── LIVE SYNC LOOP (Fast Polling) ─────── */
    function checkForUpdates() {
        const currentUpdate = localStorage.getItem(KEYS.TOOLS_UPDATED) || '0';
        if (currentUpdate !== lastToolsUpdate) {
            lastToolsUpdate = currentUpdate;
            console.log('🔄 Tools config changed, syncing...');

            const toolId = getCurrentToolId();
            const tools = getData(KEYS.TOOLS, []);
            const tool = toolId ? tools.find(t => t.id === toolId) : null;

            if (tool && !tool.enabled) {
                showDisabledPage(tool);
            } else if (tool && tool.enabled) {
                removeDisabledOverlay();
            }

            hideDisabledTools();
        }
    }

    /* ─────── COOKIE CONSENT BANNER ─────── */
    function initCookieConsent() {
        if (localStorage.getItem('aitoolcor_cookie_consent') !== null) {
            return;
        }

        const style = document.createElement('style');
        style.innerHTML = `
            .cc-banner-wrap {
                position: fixed;
                bottom: 24px;
                right: 24px;
                max-width: 400px;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: 20px;
                padding: 24px;
                box-shadow: 0 16px 40px rgba(31, 38, 135, 0.15);
                z-index: 100000;
                font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
                color: #1e293b;
                display: flex;
                flex-direction: column;
                gap: 16px;
                animation: ccFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .cc-header {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 800;
                font-size: 17px;
                color: #7c3aed;
            }
            .cc-header i {
                font-size: 20px;
                background: linear-gradient(135deg, #7c3aed, #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .cc-text {
                font-size: 13.5px;
                line-height: 1.6;
                color: #4b5563;
                margin: 0;
            }
            .cc-text a {
                color: #7c3aed;
                text-decoration: underline;
                font-weight: 600;
            }
            .cc-text a:hover {
                color: #c084fc;
            }
            .cc-buttons {
                display: flex;
                gap: 10px;
            }
            .cc-btn {
                flex: 1;
                padding: 10px 16px;
                border-radius: 50px;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                outline: none;
                text-align: center;
            }
            .cc-btn-accept {
                background: linear-gradient(135deg, #7c3aed, #ec4899);
                color: #fff;
                box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
            }
            .cc-btn-accept:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
            }
            .cc-btn-reject {
                background: rgba(243, 244, 246, 0.8);
                color: #4b5563;
                border: 1px solid rgba(229, 231, 235, 1);
            }
            .cc-btn-reject:hover {
                background: rgba(229, 231, 235, 1);
            }
            @keyframes ccFadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes ccFadeOutDown {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(30px); }
            }
            @media (max-width: 480px) {
                .cc-banner-wrap {
                    left: 16px;
                    right: 16px;
                    bottom: 16px;
                    max-width: none;
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(style);

        const banner = document.createElement('div');
        banner.className = 'cc-banner-wrap';
        banner.innerHTML = `
            <div class="cc-header">
                <i class="fas fa-cookie-bite"></i>
                <span>We Value Your Privacy</span>
            </div>
            <p class="cc-text">
                We use cookies to personalize content and ads, analyze our traffic, and improve your user experience. By clicking "Accept All", you agree to our use of cookies. Read more in our <a href="/privacy.html">Privacy Policy</a>.
            </p>
            <div class="cc-buttons">
                <button class="cc-btn cc-btn-reject" id="ccRejectBtn">Reject All</button>
                <button class="cc-btn cc-btn-accept" id="ccAcceptBtn">Accept All</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('ccAcceptBtn').onclick = () => {
            localStorage.setItem('aitoolcor_cookie_consent', 'accepted');
            closeBanner();
        };

        document.getElementById('ccRejectBtn').onclick = () => {
            localStorage.setItem('aitoolcor_cookie_consent', 'rejected');
            closeBanner();
        };

        function closeBanner() {
            banner.style.animation = 'ccFadeOutDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => banner.remove(), 450);
        }
    }

    /* ─────── INIT ─────── */
    function init() {
        lastToolsUpdate = localStorage.getItem(KEYS.TOOLS_UPDATED) || '0';

        trackVisit();
        checkToolStatus();
        hideDisabledTools();
        initCookieConsent();

        // FAST polling every 2 seconds for instant sync
        setInterval(checkForUpdates, 2000);

        // Also listen to storage event (cross-tab)
        window.addEventListener('storage', (e) => {
            if (e.key === KEYS.TOOLS || e.key === KEYS.TOOLS_UPDATED) {
                checkForUpdates();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ AI ToolCor tracker active (2s live sync)');
})();