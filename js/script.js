// ==========================================
// PDF TOOLS - HOMEPAGE JS - FIXED & FAST
// ==========================================

// ========== MOBILE MENU ==========
function toggleMenu() {
    var navLinks = document.getElementById('navLinks');
    var hamburger = document.getElementById('hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
        document.getElementById('navLinks').classList.remove('active');
        document.getElementById('hamburger').classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ========== SEARCH TOOLS ==========
function searchTools() {
    var query = document.getElementById('searchInput').value.toLowerCase().trim();
    var cards = document.querySelectorAll('.tool-card');
    var found = 0;

    cards.forEach(function(card) {
        var name  = (card.getAttribute('data-name') || '').toLowerCase();
        var title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
        var desc  = card.querySelector('p')  ? card.querySelector('p').textContent.toLowerCase()  : '';

        var match = name.indexOf(query) !== -1 ||
                    title.indexOf(query) !== -1 ||
                    desc.indexOf(query) !== -1;

        if (query === '' || match) {
            card.style.display = '';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update tabs
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    if (query === '') {
        var firstTab = document.querySelector('.tab');
        if (firstTab) firstTab.classList.add('active');
    }

    // No results message
    var noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = (found === 0 && query !== '') ? 'block' : 'none';
    }
}

// ========== FILTER BY CATEGORY ==========
function filterTools(category, btn) {
    var cards = document.querySelectorAll('.tool-card');

    // Update tab
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');

    // Clear search
    document.getElementById('searchInput').value = '';

    // Hide no results
    var noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = 'none';

    // ✅ Simple show/hide - NO delay, NO animation lag
    cards.forEach(function(card) {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.pageYOffset > 80) {
        navbar.style.background = 'rgba(255,255,255,0.88)';
        navbar.style.boxShadow = '0 4px 20px rgba(31,38,135,0.12)';
    } else {
        navbar.style.background = 'rgba(255,255,255,0.25)';
        navbar.style.boxShadow = '0 4px 20px rgba(31,38,135,0.06)';
    }
}, { passive: true }); // ✅ passive:true = smooth scroll

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(e) {
    // '/' = focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        var searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    // 'Escape' = close menu
    if (e.key === 'Escape') {
        document.getElementById('navLinks').classList.remove('active');
        document.getElementById('hamburger').classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ========== STATS - SIMPLE (No animation jank) ==========
// ✅ Static numbers - no requestAnimationFrame loop
document.addEventListener('DOMContentLoaded', function() {
    // Just show static values - already in HTML
    console.log('✅ PDFTools Homepage Ready');
});

console.log('✅ PDFTools script.js loaded');

