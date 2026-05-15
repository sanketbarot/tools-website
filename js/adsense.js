/* ════════════════════════════════════════
   AIToolCor - ADSENSE AUTO LOADER
   With Sidebar Support
════════════════════════════════════════ */

const ADSENSE_CONFIG = {
    publisherId: 'ca-pub-8473875587893208',
    slots: {
        topBanner:    '3658236067',
        middleBanner: '1677271683',
        bottomBanner: '5805658347',
        sidebar:      '3179495009',
        inArticle:    '9876765292',
    }
};

(function() {
    'use strict';

    function createAdUnit(slotId, format, extraStyle, className) {
        if (!slotId || slotId === 'XXXXXXXXXX') return null;
        const wrapper = document.createElement('div');
        wrapper.className = className || 'ad-container ad-banner';
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.innerHTML = `
            <span class="ad-label">Advertisement</span>
            <ins class="adsbygoogle"
                 style="display:block;${extraStyle || ''}"
                 data-ad-client="${ADSENSE_CONFIG.publisherId}"
                 data-ad-slot="${slotId}"
                 data-ad-format="${format || 'auto'}"
                 data-full-width-responsive="true"></ins>`;
        return wrapper;
    }

    function pushAd() {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('Ad push skipped:', e.message);
        }
    }

    function insertAdBefore(targetSelector, slotKey, format) {
        const target = document.querySelector(targetSelector);
        const slotId = ADSENSE_CONFIG.slots[slotKey];
        if (!target || !slotId) return false;
        const adEl = createAdUnit(slotId, format);
        if (!adEl) return false;
        target.parentNode.insertBefore(adEl, target);
        pushAd();
        return true;
    }

    function insertAdAfter(targetSelector, slotKey, format) {
        const target = document.querySelector(targetSelector);
        const slotId = ADSENSE_CONFIG.slots[slotKey];
        if (!target || !slotId) return false;
        const adEl = createAdUnit(slotId, format);
        if (!adEl) return false;
        target.parentNode.insertBefore(adEl, target.nextSibling);
        pushAd();
        return true;
    }

    /* ════════════════════════════════════════
       SIDEBAR ADS - Desktop only (>= 1200px)
    ════════════════════════════════════════ */
    function insertSidebarAds() {
        if (window.innerWidth < 1200) return; // Only desktop

        const slotId = ADSENSE_CONFIG.slots.sidebar;
        if (!slotId) return;

        // Left Sidebar Ad
        const leftAd = document.createElement('div');
        leftAd.className = 'ad-sidebar ad-sidebar-left';
        leftAd.innerHTML = `
            <span class="ad-label">Ad</span>
            <ins class="adsbygoogle"
                 style="display:block;width:160px;height:600px"
                 data-ad-client="${ADSENSE_CONFIG.publisherId}"
                 data-ad-slot="${slotId}"
                 data-ad-format="vertical"></ins>`;
        document.body.appendChild(leftAd);
        pushAd();

        // Right Sidebar Ad
        const rightAd = document.createElement('div');
        rightAd.className = 'ad-sidebar ad-sidebar-right';
        rightAd.innerHTML = `
            <span class="ad-label">Ad</span>
            <ins class="adsbygoogle"
                 style="display:block;width:160px;height:600px"
                 data-ad-client="${ADSENSE_CONFIG.publisherId}"
                 data-ad-slot="${slotId}"
                 data-ad-format="vertical"></ins>`;
        document.body.appendChild(rightAd);
        pushAd();
    }

    function autoPlaceAds() {
        const isToolPage = !!document.querySelector('.tool-area');
        const isHomePage = !!document.querySelector('.tools-grid, .tool-cards-grid, [data-category]');

        if (isHomePage && !isToolPage) {
            // Homepage - NO middle ad in tools (clean look)
            insertAdAfter('.hero, .hero-section, .tool-header', 'topBanner', 'horizontal');
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }
        else if (isToolPage) {
            insertAdBefore('.tool-area', 'topBanner', 'horizontal');
            insertAdAfter('.tool-area', 'inArticle', 'auto');
            insertAdBefore('.faq-section', 'middleBanner', 'auto');
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }

        // Sidebar ads on desktop
        insertSidebarAds();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoPlaceAds, 400);
        });
    } else {
        setTimeout(autoPlaceAds, 400);
    }

    // Re-check on resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const sidebars = document.querySelectorAll('.ad-sidebar');
            if (window.innerWidth < 1200) {
                sidebars.forEach(s => s.style.display = 'none');
            } else {
                sidebars.forEach(s => s.style.display = 'flex');
            }
        }, 200);
    });

})();