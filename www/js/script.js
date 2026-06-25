/* ==========================================
   AI TOOLCOR — HOMEPAGE JS v4.0
   Dynamic, performance-optimized
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
    ham.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    document.body.style.overflow = menuOpen ? 'hidden' : '';
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

document.addEventListener('click', e => {
    if (e.target.closest('#navLinks a:not(.ndrop-btn)') && window.innerWidth <= 768) closeMenu();
    if (menuOpen && !e.target.closest('#navLinks') && !e.target.closest('#hamburger')) closeMenu();
});

window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) closeMenu();
}, 120), { passive: true });

/* ════════════════════════════════
   DROPDOWN MENUS
════════════════════════════════ */
function ddToggle(id) {
    const current = typeof id === 'string' ? $(id) : id;
    if (!current) return;
    const isOpen = current.classList.contains('open');
    $$('.ndrop').forEach(drop => {
        drop.classList.remove('open');
        const btn = drop.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
        current.classList.add('open');
        const btn = current.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
}

window.toggleMenu = toggleMenu;

function initMenuAndDropdowns() {
    // Attach click events to all dropdown buttons
    $$('.ndrop-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropdown = btn.closest('.ndrop');
            ddToggle(dropdown);
        });
    });
}

// Robust initialization to prevent timing issues where script runs after DOMContentLoaded has fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenuAndDropdowns);
} else {
    initMenuAndDropdowns();
}

// Close on outside click
document.addEventListener('click', e => {
    if (!e.target.closest('.ndrop') && !e.target.closest('.hamburger')) {
        $$('.ndrop').forEach(drop => {
            drop.classList.remove('open');
            const btn = drop.querySelector('.ndrop-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }
});

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        $$('.ndrop').forEach(drop => {
            drop.classList.remove('open');
            const btn = drop.querySelector('.ndrop-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }
});

/* ════════════════════════════════
   SEARCH — Debounced, live
════════════════════════════════ */
function searchTools() {
    const input = $('searchInput');
    const clearBtn = $('searchClearBtn');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

    const cards = $$('.tool-card');
    let found = 0;
    cards.forEach(card => {
        const name  = (card.getAttribute('data-name')  || '').toLowerCase();
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc  = (card.querySelector('p')?.textContent  || '').toLowerCase();
        const match = !query || name.includes(query) || title.includes(query) || desc.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) found++;
    });

    if (query === '') {
        $$('.tab').forEach(t => t.classList.remove('active'));
        const firstTab = document.querySelector('.tab');
        if (firstTab) { firstTab.classList.add('active'); firstTab.setAttribute('aria-selected','true'); }
    }
    const noR = $('noResults');
    if (noR) noR.style.display = (found === 0 && query) ? 'block' : 'none';
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
    $$('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const inp = $('searchInput');
    const clr = $('searchClearBtn');
    if (inp) inp.value = '';
    if (clr) clr.classList.remove('visible');

    const noR = $('noResults');
    if (noR) noR.style.display = 'none';

    $$('.tool-card').forEach(card => {
        const show = category === 'all' || card.getAttribute('data-category') === category;
        card.style.display = show ? '' : 'none';
    });
}

/* ════════════════════════════════
   FAQ ACCORDION
════════════════════════════════ */
function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    $$('.faq-item').forEach(faq => faq.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

/* ════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════ */
document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === '/' && !isTyping) {
        e.preventDefault();
        const s = $('searchInput');
        if (s) { s.focus(); s.select(); }
    }
    if (e.key === 'Escape') {
        closeMenu();
        $$('.ndrop').forEach(d => {
            d.classList.remove('open');
            const b = d.querySelector('.ndrop-btn');
            if (b) b.setAttribute('aria-expanded', 'false');
        });
        const s = $('searchInput');
        if (s && document.activeElement === s) {
            s.value = ''; searchTools(); s.blur();
        }
    }
});

/* ════════════════════════════════
   USER AUTH CHECK
════════════════════════════════ */
function checkUserAuth() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const navLoginBtn  = $('navLoginBtn');
        const navLoginText = $('navLoginText');
        if (!currentUser || !navLoginBtn || !navLoginText) return;
        navLoginText.textContent = currentUser.firstName || 'Account';
        navLoginBtn.href = 'javascript:void(0)';
        navLoginBtn.title = 'Click to Logout';
        navLoginBtn.onclick = () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                window.location.reload();
            }
        };
    } catch(e) {}
}

/* ════════════════════════════════
   ANIMATED NUMBER COUNTER
════════════════════════════════ */
function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const isDecimal = target.toString().includes('.');
    const numericTarget = parseFloat(target);

    function update(time) {
        const elapsed = Math.min((time - start) / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - elapsed, 3);
        const value = numericTarget * ease;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;
        if (elapsed < 1) requestAnimationFrame(update);
        else el.textContent = (isDecimal ? numericTarget.toFixed(1) : numericTarget.toLocaleString()) + suffix;
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const counterMap = [
        { text: '30+',  num: 30,    suffix: '+' },
        { text: '1M+',  num: 1000,  suffix: 'K+' },
        { text: '500K+',num: 500,   suffix: 'K+' },
        { text: '99.9%',num: 99.9,  suffix: '%' },
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
    if (!('IntersectionObserver' in window)) {
        $$('.animate-on-scroll, .stagger-children').forEach(el => el.classList.add('visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger counters when stats section comes into view
                if (entry.target.classList.contains('stats-section')) {
                    setTimeout(initCounters, 200);
                }
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    $$('.animate-on-scroll, .stagger-children').forEach(el => io.observe(el));

    // Observe stats section specifically
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) io.observe(statsSection);
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
    const input = $('searchInput');
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
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - offset - 12,
                behavior: 'smooth'
            });
        });
    });
}

/* ════════════════════════════════
   TOOL CARD RIPPLE EFFECT
════════════════════════════════ */
function initRippleEffect() {
    $$('.tool-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Create ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                position:absolute;
                border-radius:50%;
                pointer-events:none;
                width:${size}px;
                height:${size}px;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
                background:rgba(20,184,166,0.15);
                transform:scale(0);
                animation:rippleAnim 0.5s ease-out forwards;
            `;
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    // Add ripple keyframe if not present
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }`;
        document.head.appendChild(style);
    }
}

/* ════════════════════════════════
   HERO SEARCH SUGGESTIONS (dynamic)
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
    ];
    let idx = 0;
    setInterval(() => {
        if (document.activeElement !== input) {
            idx = (idx + 1) % hints.length;
            input.placeholder = hints[idx];
        }
    }, 3500);
}

/* ════════════════════════════════
   TOOLS GRID — add stagger class
════════════════════════════════ */
function initToolsGrid() {
    const grid = $('toolsGrid');
    if (grid) grid.classList.add('stagger-children');
}

/* ════════════════════════════════
   COPY-TO-CLIPBOARD TOAST
   (used if pages need it globally)
════════════════════════════════ */
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.tc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'tc-toast';
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${msg}`;
    toast.style.cssText = `
        position:fixed; bottom:32px; left:50%; transform:translateX(-50%) translateY(20px);
        background:${type === 'success' ? 'var(--primary)' : '#334155'};
        color:#fff; padding:11px 22px; border-radius:50px;
        font-size:13px; font-weight:600; z-index:9999;
        display:flex; align-items:center; gap:8px;
        box-shadow:0 8px 24px rgba(0,0,0,0.35);
        opacity:0; transition:all 0.28s cubic-bezier(0.4,0,0.2,1);
        pointer-events:none;
    `;
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
   HERO FLOATING BADGES ANIMATION
════════════════════════════════ */
function initHeroEntrance() {
    const badge = document.querySelector('.hero-badge');
    const h1 = document.querySelector('.hero h1');
    const p  = document.querySelector('.hero p');
    const search = document.querySelector('.hero-search');
    const stats  = document.querySelector('.hero-stats');

    const els = [badge, h1, p, search, stats].filter(Boolean);
    els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.55s ease ${0.1 + i * 0.10}s, transform 0.55s ease ${0.1 + i * 0.10}s`;
    });

    requestAnimationFrame(() => {
        setTimeout(() => {
            els.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 80);
    });
}

/* ════════════════════════════════
   INIT
════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    initFooterYear();
    initSearch();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();
    initRippleEffect();
    initSearchPlaceholderRotation();
    initToolsGrid();
    initHeroEntrance();

    // Expose globally for inline HTML usage
    window.showToast = showToast;

    console.log('✅ AI ToolCor v5.0 loaded');
});