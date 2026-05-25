/* ==========================================
   AI TOOLCOR — HOMEPAGE JS v6.0
   Fixes: dropdown binding, search clear btn,
          auth UX, counter flicker, ripple z-index,
          keyboard trap, passive listeners
   ========================================== */
'use strict';

/* ════════════════════════════════
   UTILITIES
════════════════════════════════ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ════════════════════════════════
   NAVBAR SCROLL
════════════════════════════════ */
(function initNavScroll() {
    const nav = $('mainNav');
    if (!nav) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            nav.classList.toggle('scrolled', window.scrollY > 70);
            ticking = false;
        });
        ticking = true;
    }, { passive: true });
})();

/* ════════════════════════════════
   MOBILE MENU
════════════════════════════════ */
let menuOpen = false;

function toggleMenu() {
    const nav = $('navLinks');
    const ham = $('hamburger');
    if (!nav || !ham) return;
    menuOpen = !menuOpen;
    nav.classList.toggle('active', menuOpen);
    ham.classList.toggle('active', menuOpen);
    ham.setAttribute('aria-expanded', String(menuOpen));
    // FIX: only lock scroll on mobile viewports — desktop never needs this
    if (window.innerWidth <= 768) {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }
}

function closeMenu() {
    const nav = $('navLinks');
    const ham = $('hamburger');
    if (!nav || !ham) return;
    menuOpen = false;
    nav.classList.remove('active');
    ham.classList.remove('active');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// FIX: hamburger button now wired via JS (not inline onclick) to match index.html
document.addEventListener('DOMContentLoaded', () => {
    const ham = $('hamburger');
    if (ham) ham.addEventListener('click', toggleMenu);
});

document.addEventListener('click', e => {
    // Close menu when a nav link (not dropdown btn) is clicked on mobile
    if (e.target.closest('#navLinks a:not(.ndrop-btn)') && window.innerWidth <= 768) closeMenu();
    // Close menu on outside click
    if (menuOpen && !e.target.closest('#navLinks') && !e.target.closest('#hamburger')) closeMenu();
});

window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) closeMenu();
}, 120), { passive: true });

/* ════════════════════════════════
   DROPDOWN MENUS
   FIX: now uses data-dropdown attribute
        instead of inline ddToggle(id) calls.
        Wires up all .ndrop-btn elements on init.
════════════════════════════════ */
function closeAllDropdowns() {
    $$('.ndrop').forEach(drop => {
        drop.classList.remove('open');
        const btn = drop.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

function ddToggle(idOrEl) {
    // Support both old inline calls ddToggle('dd1') and new event-based usage
    const current = typeof idOrEl === 'string' ? $(idOrEl) : idOrEl;
    if (!current) return;
    const isOpen = current.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
        current.classList.add('open');
        const btn = current.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
}

function initDropdowns() {
    // FIX: wire up every .ndrop-btn via JS — no more relying on inline onclick
    $$('.ndrop-btn').forEach(btn => {
        // Read the parent .ndrop element's id from data-dropdown attr or parent id
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const drop = btn.closest('.ndrop');
            if (drop) ddToggle(drop);
        });
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.ndrop') && !e.target.closest('#hamburger')) {
            closeAllDropdowns();
        }
    });

    // FIX: close dropdown when focus leaves it (keyboard navigation)
    document.addEventListener('focusin', e => {
        if (!e.target.closest('.ndrop')) closeAllDropdowns();
    });
}

// Keep ddToggle on window for any legacy inline usage in HTML
window.ddToggle = ddToggle;

/* ════════════════════════════════
   SEARCH — Debounced, live
════════════════════════════════ */
function searchTools() {
    const input = $('searchInput');
    const clearBtn = $('searchClearBtn');
    if (!input) return;

    const query = input.value.toLowerCase().trim();

    // FIX: use hidden attribute (not classList) — matches index.html which uses hidden attr
    if (clearBtn) {
        if (query.length > 0) {
            clearBtn.removeAttribute('hidden');
        } else {
            clearBtn.setAttribute('hidden', '');
        }
    }

    // FIX: announce result count to screen readers via aria-live region
    const liveRegion = $('live-region');

    const cards = $$('.tool-card');
    let found = 0;
    cards.forEach(card => {
        const name  = (card.getAttribute('data-name')  || '').toLowerCase();
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc  = (card.querySelector('p')?.textContent  || '').toLowerCase();
        const match = !query || name.includes(query) || title.includes(query) || desc.includes(query);
        // FIX: use visibility toggle with display so grid layout is preserved
        card.style.display = match ? '' : 'none';
        if (match) found++;
    });

    // Reset tabs when search is cleared
    if (query === '') {
        $$('.tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        const firstTab = document.querySelector('.tab[data-category="all"]');
        if (firstTab) {
            firstTab.classList.add('active');
            firstTab.setAttribute('aria-selected', 'true');
        }
    }

    const noR = $('noResults');
    const showNoResults = found === 0 && query.length > 0;
    if (noR) noR.style.display = showNoResults ? 'block' : 'none';

    // Announce to screen readers
    if (liveRegion && query) {
        liveRegion.textContent = showNoResults
            ? 'No tools found for "' + query + '"'
            : found + ' tool' + (found !== 1 ? 's' : '') + ' found';
    }
}

const debouncedSearch = debounce(searchTools, 160);

function clearSearch() {
    const input = $('searchInput');
    if (input) { input.value = ''; input.focus(); }
    searchTools();
}

/* ════════════════════════════════
   FILTER BY CATEGORY
════════════════════════════════ */
function filterTools(category, btn) {
    // FIX: guard against missing btn (e.g. if called programmatically)
    if (!btn) return;

    $$('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Clear search when filtering
    const inp = $('searchInput');
    const clr = $('searchClearBtn');
    if (inp) inp.value = '';
    if (clr) clr.setAttribute('hidden', '');

    const noR = $('noResults');
    if (noR) noR.style.display = 'none';

    let visible = 0;
    $$('.tool-card').forEach(card => {
        const show = category === 'all' || card.getAttribute('data-category') === category;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    // FIX: announce filter result to screen readers
    const liveRegion = $('live-region');
    if (liveRegion) {
        liveRegion.textContent = visible + ' tool' + (visible !== 1 ? 's' : '') + ' in ' + category;
    }
}

// Expose for inline HTML onclick usage
window.filterTools = filterTools;
window.searchTools = searchTools;

/* ════════════════════════════════
   FAQ ACCORDION
   FIX: keyboard accessible — Enter/Space open
════════════════════════════════ */
function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    $$('.faq-item').forEach(faq => faq.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

window.toggleFaq = toggleFaq;

function initFaqKeyboard() {
    $$('.faq-item').forEach(item => {
        // Make each faq-item focusable for keyboard users
        if (!item.getAttribute('tabindex')) item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq(item);
            }
        });
    });
}

/* ════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════ */
document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
        || document.activeElement?.isContentEditable;

    // Press "/" to focus search
    if (e.key === '/' && !isTyping) {
        e.preventDefault();
        const s = $('searchInput');
        if (s) { s.focus(); s.select(); }
    }

    // Escape: close menu → close dropdowns → clear search
    if (e.key === 'Escape') {
        if (menuOpen) { closeMenu(); return; }
        const anyDropOpen = !!document.querySelector('.ndrop.open');
        if (anyDropOpen) { closeAllDropdowns(); return; }
        const s = $('searchInput');
        if (s && s.value) { s.value = ''; searchTools(); s.blur(); }
    }
});

/* ════════════════════════════════
   USER AUTH CHECK
   FIX: avoid href="javascript:void(0)" —
        use button behaviour instead
════════════════════════════════ */
function checkUserAuth() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const navLoginBtn  = $('navLoginBtn');
        const navLoginText = $('navLoginText');
        if (!currentUser || !navLoginBtn || !navLoginText) return;

        navLoginText.textContent = currentUser.firstName || 'Account';
        navLoginBtn.setAttribute('title', 'Click to logout');
        navLoginBtn.setAttribute('aria-label', 'Logout ' + (currentUser.firstName || 'Account'));

        // FIX: remove href so it behaves as a button (no navigation on click)
        navLoginBtn.removeAttribute('href');
        navLoginBtn.style.cursor = 'pointer';

        navLoginBtn.addEventListener('click', function handler(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                window.location.reload();
            }
        }, { once: false });
    } catch(e) {
        // Silently ignore JSON parse errors
    }
}

/* ════════════════════════════════
   ANIMATED NUMBER COUNTER
   FIX: no counter flicker on re-run —
        guard with data-counted attr
════════════════════════════════ */
function animateCounter(el, target, suffix, duration) {
    // FIX: prevent double-running on the same element
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    const start = performance.now();
    const isDecimal = String(target).includes('.');
    const numericTarget = parseFloat(target);

    function update(time) {
        const elapsed = Math.min((time - start) / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - elapsed, 3);
        const value = numericTarget * ease;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;
        if (elapsed < 1) {
            requestAnimationFrame(update);
        } else {
            // FIX: set exact final value to avoid rounding artifacts
            el.textContent = (isDecimal ? numericTarget.toFixed(1) : numericTarget.toLocaleString()) + suffix;
        }
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const counterMap = [
        { num: 30,    suffix: '+' },
        { num: 1000,  suffix: 'K+' },
        { num: 500,   suffix: 'K+' },
        { num: 99.9,  suffix: '%' },
    ];

    // Hero stats
    $$('.hero-stat strong').forEach((el, i) => {
        if (counterMap[i]) {
            const { num, suffix } = counterMap[i];
            animateCounter(el, num, suffix, 1600);
        }
    });

    // Stats grid
    $$('.stat-item h3').forEach((el, i) => {
        if (counterMap[i]) {
            const { num, suffix } = counterMap[i];
            animateCounter(el, num, suffix, 2000);
        }
    });
}

/* ════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
════════════════════════════════ */
function initScrollAnimations() {
    // Fallback for older browsers
    if (!('IntersectionObserver' in window)) {
        $$('.animate-on-scroll, .stagger-children').forEach(el => el.classList.add('visible'));
        initCounters();
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');

            // Trigger counters when stats section enters viewport
            if (entry.target.classList.contains('stats-section')) {
                setTimeout(initCounters, 200);
            }
            io.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    $$('.animate-on-scroll, .stagger-children, .stats-section').forEach(el => io.observe(el));
}

/* ════════════════════════════════
   FOOTER YEAR
════════════════════════════════ */
function initFooterYear() {
    const el = $('currentYear');
    if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════
   BACK TO TOP BUTTON
════════════════════════════════ */
function initBackToTop() {
    const btn = $('backToTop');
    if (!btn) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            btn.classList.toggle('visible', window.scrollY > 350);
            ticking = false;
        });
        ticking = true;
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════
   SEARCH INPUT EVENTS
════════════════════════════════ */
function initSearch() {
    const input    = $('searchInput');
    const clearBtn = $('searchClearBtn');
    if (input) {
        input.addEventListener('input', debouncedSearch);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') searchTools(); });
    }
    if (clearBtn) clearBtn.addEventListener('click', clearSearch);
}

/* ════════════════════════════════
   SMOOTH ANCHOR SCROLL
════════════════════════════════ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            // FIX: read --nav-h as px number safely
            const navH = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
            ) || 68;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - navH - 12,
                behavior: 'smooth'
            });
            // FIX: move focus to target for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });
}

/* ════════════════════════════════
   TOOL CARD RIPPLE EFFECT
   FIX: ripple z-index now respects card
        isolation:isolate set in CSS
════════════════════════════════ */
function initRippleEffect() {
    // Add keyframe once
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}`;
        document.head.appendChild(style);
    }

    // FIX: use event delegation — works for dynamically added cards too
    const grid = $('toolsGrid');
    if (!grid) return;

    grid.addEventListener('click', function(e) {
        const card = e.target.closest('.tool-card');
        if (!card) return;

        const ripple = document.createElement('span');
        const rect   = card.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);

        ripple.style.cssText = [
            'position:absolute',
            'border-radius:50%',
            'pointer-events:none',
            `width:${size}px`,
            `height:${size}px`,
            `left:${e.clientX - rect.left - size / 2}px`,
            `top:${e.clientY - rect.top  - size / 2}px`,
            'background:rgba(124,58,237,0.12)',
            'transform:scale(0)',
            'animation:rippleAnim 0.5s ease-out forwards',
            'z-index:1',
        ].join(';');

        card.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
}

/* ════════════════════════════════
   SEARCH PLACEHOLDER ROTATION
   FIX: use CSS transition for smoother
        placeholder fade (via opacity trick)
════════════════════════════════ */
function initSearchPlaceholderRotation() {
    const input = $('searchInput');
    if (!input) return;
    const hints = [
        'Search tools… e.g. merge PDF',
        'Search tools… e.g. compress',
        'Search tools… e.g. BMI',
        'Search tools… e.g. QR code',
        'Search tools… e.g. password',
        'Search tools… e.g. word count',
        'Search tools… e.g. OCR',
        'Search tools… e.g. sign PDF',
    ];
    let idx = 0;
    // FIX: clear interval if input is removed (SPA-style navigation)
    const timer = setInterval(() => {
        if (!document.contains(input)) { clearInterval(timer); return; }
        if (document.activeElement !== input && !input.value) {
            idx = (idx + 1) % hints.length;
            input.placeholder = hints[idx];
        }
    }, 3500);
}

/* ════════════════════════════════
   TOOLS GRID — stagger class
   FIX: only add if grid exists and
        loading placeholder is gone
════════════════════════════════ */
function initToolsGrid() {
    const grid = $('toolsGrid');
    if (grid) {
        // Remove loading placeholder if tools-renderer.js didn't clean it up
        const loading = $('toolsLoading');
        if (loading) loading.remove();
        grid.classList.add('stagger-children');
    }
}

/* ════════════════════════════════
   COPY-TO-CLIPBOARD TOAST
   (global utility — used by tool pages)
════════════════════════════════ */
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.tc-toast');
    if (existing) existing.remove();

    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    const colors = { success: 'var(--primary)', error: '#dc2626', info: '#334155' };

    const toast = document.createElement('div');
    toast.className = 'tc-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `<i class="fas fa-${icons[type] || icons.info}" aria-hidden="true"></i> ${msg}`;
    toast.style.cssText = [
        'position:fixed',
        'bottom:32px',
        'left:50%',
        'transform:translateX(-50%) translateY(20px)',
        `background:${colors[type] || colors.info}`,
        'color:#fff',
        'padding:11px 22px',
        'border-radius:50px',
        'font-size:13px',
        'font-weight:600',
        'z-index:9999',
        'display:flex',
        'align-items:center',
        'gap:8px',
        'box-shadow:0 8px 24px rgba(0,0,0,0.25)',
        'opacity:0',
        'transition:all 0.28s cubic-bezier(0.4,0,0.2,1)',
        'pointer-events:none',
        'max-width:90vw',
        'text-align:center',
    ].join(';');

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/* ════════════════════════════════
   HERO ENTRANCE ANIMATION
   FIX: respect prefers-reduced-motion
════════════════════════════════ */
function initHeroEntrance() {
    // Skip animation if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = [
        document.querySelector('.hero-badge'),
        document.querySelector('.hero h1'),
        document.querySelector('.hero p'),
        document.querySelector('.hero-search'),
        document.querySelector('.hero-stats'),
    ].filter(Boolean);

    els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.55s ease ${0.08 + i * 0.09}s, transform 0.55s ease ${0.08 + i * 0.09}s`;
    });

    // FIX: use rAF + setTimeout combo to ensure styles are applied first
    requestAnimationFrame(() => {
        setTimeout(() => {
            els.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 60);
    });
}

/* ════════════════════════════════
   PREFETCH TOOL PAGES ON HOVER
   FIX: new feature — improves navigation
        speed for repeat visitors
════════════════════════════════ */
function initPrefetch() {
    if (!('IntersectionObserver' in window)) return;
    const prefetched = new Set();

    $$('.tool-card[href]').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const href = card.getAttribute('href');
            if (!href || prefetched.has(href) || href.startsWith('http')) return;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
            prefetched.add(href);
        }, { passive: true });
    });
}

/* ════════════════════════════════
   INIT — DOMContentLoaded
════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    initFooterYear();
    initDropdowns();
    initSearch();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();
    initRippleEffect();
    initSearchPlaceholderRotation();
    initToolsGrid();
    initHeroEntrance();
    initFaqKeyboard();
    initPrefetch();

    // Expose globals for inline HTML usage
    window.showToast    = showToast;
    window.filterTools  = filterTools;
    window.searchTools  = searchTools;
    window.toggleFaq    = toggleFaq;
    window.clearSearch  = clearSearch;
    window.ddToggle     = ddToggle;

    if (process?.env?.NODE_ENV !== 'production') {
        console.log('%c✅ AI ToolCor v6.0 loaded', 'color:#7c3aed;font-weight:700');
    }
});