/* ════════════════════════════════════════════════
   AI TOOLCOR — UNIVERSAL SITE TRACKER
   Add this to ALL pages (index + every tool page)
   Tracks visits, syncs with admin panel
════════════════════════════════════════════════ */

(function() {
    'use strict';

    const KEYS = {
        TOOLS: 'aitoolcor_tools_config',
        ANALYTICS: 'aitoolcor_analytics',
        ACTIVITY: 'aitoolcor_activity_log'
    };

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
        const path = window.location.pathname.split('/').pop().replace('.html', '');
        if (!path || path === 'index' || path === '') return null;
        return path;
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

        // Log activity
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
                meta: `Total visits today: ${analytics.dailyVisits[today]}`
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

        const disabledIds = tools.filter(t => !t.enabled).map(t => t.id);

        // Hide tool cards on homepage
        document.querySelectorAll('.tool-card').forEach(card => {
            const href = card.getAttribute('href') || '';
            const toolId = href.replace('.html', '').replace('/', '').replace('./', '');
            if (disabledIds.includes(toolId)) {
                card.style.display = 'none';
            } else {
                card.style.display = '';
            }
        });

        // Update visible count
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
        document.body.innerHTML = `
            <div style="
                position:fixed;inset:0;
                background:linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95);
                display:flex;align-items:center;justify-content:center;
                color:#fff;text-align:center;padding:20px;
                font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
                z-index:99999;">
                <div style="max-width:500px;animation:fadeUp 0.6s ease;">
                    <div style="font-size:90px;margin-bottom:20px;animation:bounce 2s infinite;">🔧</div>
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
                            box-shadow:0 8px 24px rgba(124,58,237,0.4);
                            transition:transform 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-home"></i> Back to Home
                        </a>
                        <a href="/#tools" style="
                            display:inline-flex;align-items:center;gap:8px;
                            background:rgba(255,255,255,0.1);
                            color:#fff;padding:14px 28px;
                            border-radius:50px;text-decoration:none;
                            font-weight:700;font-size:14px;
                            border:1.5px solid rgba(255,255,255,0.2);
                            transition:all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                            <i class="fas fa-th"></i> Browse Tools
                        </a>
                    </div>
                </div>
                <style>
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }
                </style>
            </div>
        `;
    }

    /* ─────── LIVE SYNC (Cross-tab) ─────── */
    window.addEventListener('storage', (e) => {
        if (e.key === KEYS.TOOLS) {
            hideDisabledTools();
            checkToolStatus();
        }
    });

    /* ─────── INIT ─────── */
    function init() {
        trackVisit();
        checkToolStatus();
        hideDisabledTools();
        // Re-check every 10 seconds
        setInterval(() => {
            hideDisabledTools();
            checkToolStatus();
        }, 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ AI ToolCor tracker active');
})();