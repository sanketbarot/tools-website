// ==========================================
// TOOL PAGE JS v4.0 — DARK THEME EDITION
// Matches index.html dark navy theme
// Performance · Dynamic · Fast Download
// ==========================================
'use strict';

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    const ham = document.getElementById('hamburger');
    if (!nav || !ham) return;
    const isOpen = nav.classList.toggle('active');
    nav.classList.toggle('open', isOpen);
    ham.classList.toggle('active', isOpen);
    ham.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
}
window.toggleMenu = toggleMobileMenu;

/* ── DROPDOWN TOGGLE ── */
window.ddToggle = function(id) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.ndrop').forEach(d => {
        d.classList.remove('open');
        const btn = d.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
        dropdown.classList.add('open');
        const btn = dropdown.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
};

/* ── CLOSE ON ESCAPE ── */
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    const nav = document.getElementById('navLinks');
    const ham = document.getElementById('hamburger');
    if (nav) { nav.classList.remove('active', 'open'); }
    if (ham) { ham.classList.remove('active'); ham.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
    document.querySelectorAll('.ndrop.open').forEach(d => {
        d.classList.remove('open');
        const btn = d.querySelector('.ndrop-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}, { passive: true });

/* ── CLICK OUTSIDE TO CLOSE ── */
document.addEventListener('click', function(e) {
    const nav = document.getElementById('navLinks');
    const ham = document.getElementById('hamburger');
    if (nav && ham && (nav.classList.contains('open') || nav.classList.contains('active'))) {
        if (!nav.contains(e.target) && !ham.contains(e.target)) {
            nav.classList.remove('active', 'open');
            ham.classList.remove('active');
            ham.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    document.querySelectorAll('.ndrop.open').forEach(d => {
        if (!d.contains(e.target)) {
            d.classList.remove('open');
            const btn = d.querySelector('.ndrop-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    });
}, { passive: true });

/* ── RESET ON RESIZE ── */
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const nav = document.getElementById('navLinks');
        const ham = document.getElementById('hamburger');
        if (nav) nav.classList.remove('active', 'open');
        if (ham) { ham.classList.remove('active'); ham.setAttribute('aria-expanded', 'false'); }
        document.body.style.overflow = '';
    }
}, { passive: true });

/* ── NAV LINK CLOSE ── */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#navLinks > a, .ndrop-menu a').forEach(link => {
        link.addEventListener('click', function() {
            const nav = document.getElementById('navLinks');
            const ham = document.getElementById('hamburger');
            if (nav) nav.classList.remove('active', 'open');
            if (ham) { ham.classList.remove('active'); ham.setAttribute('aria-expanded', 'false'); }
            document.body.style.overflow = '';
        });
    });
});

/* ── NAVBAR SCROLL — dark theme ── */
let _scrollTicking = false;
window.addEventListener('scroll', function() {
    if (_scrollTicking) return;
    _scrollTicking = true;
    requestAnimationFrame(function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const scrolled = window.pageYOffset > 60;
            if (scrolled) {
                navbar.style.background = 'rgba(255,255,255,0.97)';
                navbar.style.boxShadow  = '0 4px 24px rgba(124,58,237,0.10)';
                navbar.style.borderBottomColor = 'rgba(124,58,237,0.12)';
            } else {
                navbar.style.background = 'rgba(255,255,255,0.78)';
                navbar.style.boxShadow  = '0 2px 16px rgba(124,58,237,0.06)';
                navbar.style.borderBottomColor = 'rgba(124,58,237,0.08)';
            }
        }

        // Back to top button
        const btt = document.getElementById('backToTop');
        if (btt) btt.classList.toggle('visible', window.pageYOffset > 350);

        _scrollTicking = false;
    });
}, { passive: true });

/* ── BACK TO TOP ── */
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('backToTop');
    if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

/* ── FAQ TOGGLE ── */
function toggleFaq(el) {
    const isActive = el.classList.contains('active');
    // Close all open items
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== el) item.classList.remove('active');
    });
    el.classList.toggle('active', !isActive);
}
window.toggleFaq = toggleFaq;

/* ── SHOW / HIDE SECTIONS ── */
function showSection(id) {
    document.querySelectorAll('[data-section]').forEach(s => { s.style.display = 'none'; });
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        // Smooth entrance — rAF deferred
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }));
    }
}
window.showSection = showSection;

/* ── FORMAT FILE SIZE ── */
function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
var szF = formatSize;
window.formatSize = formatSize;
window.szF = formatSize;

/* ── SIMULATE PROGRESS ── */
function simulateProcess(callback, speed) {
    speed = speed || 180;
    let progress = 0;
    const bar  = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    const timer = setInterval(function() {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
            if (bar)  bar.style.width   = '100%';
            if (text) text.textContent  = '100%';
            setTimeout(function() { if (typeof callback === 'function') callback(); }, 350);
        } else {
            if (bar)  bar.style.width   = progress + '%';
            if (text) text.textContent  = Math.floor(progress) + '%';
        }
    }, speed);
}

/* ── SETUP DROP ZONE ── */
function setupDropZone(zoneId, inputId, acceptTypes, onFilesAdded) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    ['dragenter','dragover'].forEach(ev =>
        zone.addEventListener(ev, function(e) {
            e.preventDefault();
            zone.classList.add('drag-over');
        }));
    ['dragleave','dragend'].forEach(ev =>
        zone.addEventListener(ev, function() { zone.classList.remove('drag-over'); }));

    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        let files = Array.from(e.dataTransfer.files);
        if (acceptTypes && acceptTypes.length) {
            files = files.filter(f => acceptTypes.some(t =>
                f.type.indexOf(t) !== -1 || f.name.toLowerCase().endsWith(t)));
        }
        if (files.length && typeof onFilesAdded === 'function') onFilesAdded(files);
    });

    zone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') input.click();
    });

    input.addEventListener('change', function() {
        const files = Array.from(input.files);
        if (files.length && typeof onFilesAdded === 'function') onFilesAdded(files);
        input.value = '';
    });
}

/* ── DOWNLOAD BLOB — fast, idle-safe, with toast ── */
function downloadBlob(blob, filename) {
    const go = () => {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
            href: url, download: filename, style: 'display:none'
        });
        document.body.appendChild(a);
        a.click();
        showToast('Download started!', 'success');
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 60000);
    };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 300 });
    else setTimeout(go, 50);
}

/* ── ESCAPE HTML ── */
function escHtml(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/* ── WAIT (async helper) ── */
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── TOAST NOTIFICATIONS ── */
function showToast(msg, type) {
    type = type || 'success';
    const existing = document.querySelector('.tc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'tc-toast';
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${msg}`;

    const colors = { success: '#7c3aed', error: '#dc2626', info: '#4b5563' };
    toast.style.background = colors[type] || colors.success;
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
window.showToast = showToast;

/* ── SCROLL ANIMATIONS — only init if tool page doesn't define its own ── */
document.addEventListener('DOMContentLoaded', function() {
    // Guard: don't init if tool page already called setupScrollAnimations
    if (window._scrollAnimsInit) return;
    window._scrollAnimsInit = true;

    if (!('IntersectionObserver' in window)) return;
    const els = document.querySelectorAll('.step-box, .related-card, .faq-item, .feature-card');
    if (!els.length) return;

    const obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    const setup = () => {
        els.forEach(function(el, i) {
            el.style.cssText += `opacity:0;transform:translateY(18px);transition:opacity 0.38s ease ${i*0.05}s,transform 0.38s ease ${i*0.05}s;`;
            obs.observe(el);
        });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(setup, { timeout: 1200 });
    else setTimeout(setup, 250);

    // Back to top button init
    const bttBtn = document.getElementById('backToTop');
    if (bttBtn) {
        bttBtn.style.display = 'flex';
        bttBtn.style.opacity = '0';
    }
});

/* ── YEAR (multi-ID) ── */
(function() {
    const year = new Date().getFullYear();
    ['currentYear','footerYear','year','footer-year'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = year;
    });
})();

/* ── RIPPLE EFFECT ON ACTION BUTTONS ── */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.action-btn, .download-btn, .upload-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.disabled) return;
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                position:absolute; border-radius:50%; pointer-events:none;
                width:${size}px; height:${size}px;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
                background:rgba(255,255,255,0.18);
                transform:scale(0);
                animation:rippleAnim 0.55s ease-out forwards;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    if (!document.getElementById('ripple-keyframe')) {
        const s = document.createElement('style');
        s.id = 'ripple-keyframe';
        s.textContent = '@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }';
        document.head.appendChild(s);
    }
});

/* ── AUTH CHECK ── */
(function checkAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        const btn  = document.getElementById('navLoginBtn');
        const text = document.getElementById('navLoginText');
        if (text) text.textContent = user.firstName || 'Account';
        if (btn)  btn.onclick = function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                location.reload();
            }
        };
    } catch(_) {}
})();

console.log('✅ tool-page.js v5.0 — light theme edition loaded');