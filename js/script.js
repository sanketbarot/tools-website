// ==========================================
// PDF TOOLS - HOMEPAGE JAVASCRIPT
// ==========================================

// ========== MOBILE MENU TOGGLE ==========
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ========== SEARCH TOOLS ==========
function searchTools() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.tool-card');
    let found = 0;

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();

        if (name.includes(query) || title.includes(query) || desc.includes(query)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.3s ease forwards';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    // Reset all tabs to inactive
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    if (query === '') {
        document.querySelector('.tab').classList.add('active');
    }
}

// ========== FILTER BY CATEGORY ==========
function filterTools(category, btn) {
    const cards = document.querySelectorAll('.tool-card');
    const tabs = document.querySelectorAll('.tab');

    // Update active tab
    tabs.forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');

    // Clear search
    document.getElementById('searchInput').value = '';

    // Filter cards with animation
    let delay = 0;
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            card.style.animation = `fadeInUp 0.4s ease ${delay}s forwards`;
            delay += 0.05;
        } else {
            card.style.display = 'none';
        }
    });
}

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(
        '.tool-card, .feature-card, .step-card, .stat-item, .section-header'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.5s ease ${index * 0.03}s`;
        scrollObserver.observe(el);
    });
});

// Add animate-in class styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ========== COUNTER ANIMATION ==========
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                if (target >= 1000000) {
                    counter.textContent = (current / 1000000).toFixed(1) + 'M';
                } else if (target >= 1000) {
                    counter.textContent = Math.floor(current / 1000) + 'K';
                } else {
                    counter.textContent = Math.floor(current);
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (target >= 1000000) {
                    counter.textContent = (target / 1000000).toFixed(0) + 'M';
                } else if (target >= 1000) {
                    counter.textContent = (target / 1000) + 'K';
                } else {
                    counter.textContent = target;
                }
            }
        };

        updateCounter();
    });
}

// Trigger counter when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ========== NAVBAR SCROLL EFFECT ==========
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        navbar.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.25)';
        navbar.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.1)';
    }

    lastScroll = currentScroll;
});

// ========== KEYBOARD SHORTCUT ==========
document.addEventListener('keydown', (e) => {
    // Press '/' to focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
});

console.log('🔥 PDFTools - Homepage Loaded Successfully!');