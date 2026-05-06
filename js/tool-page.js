// ==========================================
// COMMON TOOL PAGE JS
// Used by ALL tool pages
// ==========================================

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    const ham = document.getElementById('hamburger');
    nav.classList.toggle('active');
    ham.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}

// ========== FAQ TOGGLE ==========
function toggleFaq(el) {
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== el) item.classList.remove('active');
    });
    el.classList.toggle('active');
}

// ========== NAVBAR SCROLL ==========
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.pageYOffset > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.85)';
        navbar.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.25)';
        navbar.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.1)';
    }
});

// ========== SCROLL ANIMATIONS ==========
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.related-card, .step-box, .faq-item, .section-header').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = `all 0.5s ease ${i * 0.05}s`;
        observer.observe(el);
    });
});

// ========== FILE SIZE FORMAT ==========
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== SIMULATE PROCESSING ==========
function simulateProcess(callback, speed = 200) {
    let progress = 0;
    const bar = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    const timer = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
            setTimeout(callback, 400);
        }
        if (bar) bar.style.width = progress + '%';
        if (text) text.textContent = Math.floor(progress) + '%';
    }, speed);
}

// ========== DRAG & DROP HELPER ==========
function setupDropZone(zoneId, inputId, acceptTypes, onFilesAdded) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    ['dragenter', 'dragover'].forEach(evt => {
        zone.addEventListener(evt, e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
        });
    });

    zone.addEventListener('drop', e => {
        let files = [...e.dataTransfer.files];
        if (acceptTypes) {
            files = files.filter(f => acceptTypes.some(t => f.type.includes(t) || f.name.endsWith(t)));
        }
        if (files.length > 0) onFilesAdded(files);
    });

    zone.addEventListener('click', e => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            input.click();
        }
    });

    input.addEventListener('change', e => {
        onFilesAdded([...e.target.files]);
        input.value = '';
    });
}

// ========== SHOW/HIDE SECTIONS ==========
function showSection(id) {
    document.querySelectorAll('[data-section]').forEach(s => s.style.display = 'none');
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

// ========== RADIO OPTION SELECT ==========
document.addEventListener('click', e => {
    const opt = e.target.closest('.radio-option');
    if (opt) {
        const group = opt.parentElement;
        group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const input = opt.querySelector('input');
        if (input) input.checked = true;
    }
});

console.log('🔧 Tool Page Common JS Loaded');