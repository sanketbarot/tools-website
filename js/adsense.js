/* ════════════════════════════════════════
   AIToolCor - ADSENSE AUTO LOADER
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

    function createAdUnit(slotId, format, extraStyle) {
        if (!slotId || slotId === 'XXXXXXXXXX') return null;
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-container ad-banner';
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

    function insertAdInGrid(gridSelector, afterIndex, slotKey) {
        const grid = document.querySelector(gridSelector);
        const slotId = ADSENSE_CONFIG.slots[slotKey];
        if (!grid || !slotId) return false;
        const items = grid.children;
        if (items.length <= afterIndex) return false;
        const adEl = createAdUnit(slotId, 'auto');
        if (!adEl) return false;
        adEl.style.gridColumn = '1 / -1';
        adEl.style.maxWidth = '100%';
        items[afterIndex].after(adEl);
        pushAd();
        return true;
    }

    function autoPlaceAds() {
        const isToolPage = !!document.querySelector('.tool-area');
        const isHomePage = !!document.querySelector('.tools-grid, .tool-cards-grid, [data-category]');

        if (isHomePage && !isToolPage) {
            insertAdAfter('.hero, .hero-section, .tool-header', 'topBanner', 'horizontal');
            const gridSelectors = ['.tools-grid', '.tool-cards-grid', '.tool-cards'];
            for (const sel of gridSelectors) {
                if (insertAdInGrid(sel, 5, 'middleBanner')) break;
            }
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }
        else if (isToolPage) {
            insertAdBefore('.tool-area', 'topBanner', 'horizontal');
            insertAdAfter('.tool-area', 'inArticle', 'auto');
            insertAdBefore('.faq-section', 'middleBanner', 'auto');
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoPlaceAds, 400);
        });
    } else {
        setTimeout(autoPlaceAds, 400);
    }
})();