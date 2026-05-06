// ==========================================
// COMMON TOOL PAGE JS - FIXED & FAST
// Used by ALL tool pages
// ==========================================

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    var nav = document.getElementById('navLinks');
    var ham = document.getElementById('hamburger');
    if (!nav || !ham) return;
    nav.classList.toggle('active');
    ham.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}

// Close menu on link click
document.addEventListener('DOMContentLoaded', function() {
    var links = document.querySelectorAll('.nav-links a');
    links.forEach(function(link) {
        link.addEventListener('click', function() {
            var nav = document.getElementById('navLinks');
            var ham = document.getElementById('hamburger');
            if (nav) nav.classList.remove('active');
            if (ham) ham.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});

// ===== FAQ TOGGLE =====
function toggleFaq(el) {
    // Close others
    document.querySelectorAll('.faq-item').forEach(function(item) {
        if (item !== el) item.classList.remove('active');
    });
    el.classList.toggle('active');
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.pageYOffset > 60) {
        navbar.style.background = 'rgba(255,255,255,0.88)';
        navbar.style.boxShadow = '0 4px 20px rgba(31,38,135,0.1)';
    } else {
        navbar.style.background = 'rgba(255,255,255,0.25)';
        navbar.style.boxShadow = '0 4px 20px rgba(31,38,135,0.06)';
    }
}, { passive: true });

// ===== KEYBOARD SHORTCUT =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var nav = document.getElementById('navLinks');
        var ham = document.getElementById('hamburger');
        if (nav) nav.classList.remove('active');
        if (ham) ham.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== SHOW / HIDE SECTIONS =====
function showSection(id) {
    // Works with [data-section] OR direct IDs
    var all = document.querySelectorAll('[data-section]');
    if (all.length > 0) {
        all.forEach(function(s) { s.style.display = 'none'; });
    }
    var el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

// ===== FORMAT FILE SIZE =====
function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Alias
var szF = formatSize;

// ===== SIMULATE PROGRESS (for demo tools) =====
function simulateProcess(callback, speed) {
    speed = speed || 180;
    var progress = 0;
    var bar = document.getElementById('progressFill');
    var text = document.getElementById('progressText');

    var timer = setInterval(function() {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
            if (bar) bar.style.width = '100%';
            if (text) text.textContent = '100%';
            setTimeout(function() {
                if (typeof callback === 'function') callback();
            }, 350);
        } else {
            if (bar) bar.style.width = progress + '%';
            if (text) text.textContent = Math.floor(progress) + '%';
        }
    }, speed);
}

// ===== DRAG & DROP SETUP =====
function setupDropZone(zoneId, inputId, acceptTypes, onFilesAdded) {
    var zone = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    if (!zone || !input) return;

    // Drag events
    zone.addEventListener('dragenter', function(e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        var files = Array.from(e.dataTransfer.files);
        if (acceptTypes && acceptTypes.length > 0) {
            files = files.filter(function(f) {
                return acceptTypes.some(function(t) {
                    return f.type.indexOf(t) !== -1 || f.name.toLowerCase().endsWith(t);
                });
            });
        }
        if (files.length > 0 && typeof onFilesAdded === 'function') {
            onFilesAdded(files);
        }
    });

    // Click zone
    zone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            input.click();
        }
    });

    // File input change
    input.addEventListener('change', function(e) {
        var files = Array.from(e.target.files);
        if (files.length > 0 && typeof onFilesAdded === 'function') {
            onFilesAdded(files);
        }
        input.value = '';
    });
}

// ===== DOWNLOAD BLOB =====
function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 500);
}

// ===== ESCAPE HTML =====
function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
}

// ===== WAIT (async helper) =====
function wait(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// ===== SCROLL ANIMATIONS - FAST & SAFE =====
// ✅ Does NOT hide elements initially - just fades in when visible
document.addEventListener('DOMContentLoaded', function() {
    // Only animate non-tool-wrapper elements
    var els = document.querySelectorAll(
        '.step-box, .related-card, .faq-item, .feature-card'
    );

    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        els.forEach(function(el, i) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.35s ease ' + (i * 0.04) + 's, transform 0.35s ease ' + (i * 0.04) + 's';
            obs.observe(el);
        });
    }
    // If no IntersectionObserver support - just show everything
    else {
        els.forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
});

console.log('✅ tool-page.js loaded');