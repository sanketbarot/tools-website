// ==========================================
// PDF TOOLS - HOMEPAGE JS - FIXED & FAST
// ==========================================

// ========== MOBILE MENU TOGGLE ==========
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const hamburger = document.getElementById("hamburger");

    const isOpen = navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");

    // Jyare menu close thay tyare badha dropdowns pan close karo
    if (!isOpen) {
        document.querySelectorAll(".ndrop").forEach(drop => {
            drop.classList.remove("open");
            const btn = drop.querySelector(".ndrop-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });
    }
}

// ========== DROPDOWN TOGGLE ==========
function ddToggle(id) {
    const current = document.getElementById(id);
    const currentBtn = current.querySelector(".ndrop-btn");
    const willOpen = !current.classList.contains("open");

    // Pehla badha band karo
    document.querySelectorAll(".ndrop").forEach(drop => {
        drop.classList.remove("open");
        const btn = drop.querySelector(".ndrop-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
    });

    // Selected open karo
    if (willOpen) {
        current.classList.add("open");
        currentBtn.setAttribute("aria-expanded", "true");
    }
}

// ========== OUTSIDE CLICK - DROPDOWN CLOSE ==========
document.addEventListener("click", function(e) {
    // Jo click navbar ni bahar che to badhu close karo
    if (!e.target.closest(".ndrop") && !e.target.closest(".hamburger")) {
        document.querySelectorAll(".ndrop").forEach(drop => {
            drop.classList.remove("open");
            const btn = drop.querySelector(".ndrop-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });
    }
});

// ========== MOBILE MENU CLOSE ON LINK CLICK (Single listener - duplicates removed) ==========
document.querySelectorAll("#navLinks a").forEach(link => {
    link.addEventListener("click", function() {
        if (window.innerWidth <= 768) {
            const navLinks = document.getElementById("navLinks");
            const hamburger = document.getElementById("hamburger");

            navLinks.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");

            document.querySelectorAll(".ndrop").forEach(drop => {
                drop.classList.remove("open");
                const btn = drop.querySelector(".ndrop-btn");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });
        }
    });
});

// ========== WINDOW RESIZE - DESKTOP PAR MOBILE MENU CLOSE ==========
window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
        const navLinks = document.getElementById("navLinks");
        const hamburger = document.getElementById("hamburger");

        if (navLinks) navLinks.classList.remove("active");
        if (hamburger) {
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        }
    }
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
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Hide no results
    var noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = 'none';

    // Show/hide cards
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
}, { passive: true });

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(e) {
    // '/' = focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        var searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }

    // 'Escape' = close menu + dropdowns
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');

        if (navLinks) navLinks.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        document.querySelectorAll(".ndrop").forEach(drop => {
            drop.classList.remove("open");
            const btn = drop.querySelector(".ndrop-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });
    }
});

// ========== READY ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PDFTools Homepage Ready');
});

console.log('✅ PDFTools script.js loaded');