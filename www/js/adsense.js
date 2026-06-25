/* ════════════════════════════════════════
   AIToolCor - ADSENSE AUTO LOADER
   With Sidebar Support & Auto-Hide Empty
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

    // Observer to check if AdSense successfully loads an ad
    function observeAdStatus(insElement, wrapper) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-ad-status') {
                    const status = insElement.getAttribute('data-ad-status');
                    if (status === 'filled') {
                        wrapper.classList.add('is-filled'); // Shows the box
                    } else if (status === 'unfilled') {
                        wrapper.classList.remove('is-filled'); // Hides the box
                    }
                }
            });
        });
        observer.observe(insElement, { attributes: true });
    }

    function createAdUnit(slotId, format, extraStyle, className) {
        if (!slotId || slotId === 'XXXXXXXXXX') return null;
        
        const wrapper = document.createElement('div');
        wrapper.className = className || 'ad-container ad-banner';
        wrapper.setAttribute('aria-hidden', 'true');
        
        const label = document.createElement('span');
        label.className = 'ad-label';
        label.textContent = 'Advertisement';
        wrapper.appendChild(label);

        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.setAttribute('style', `display:block;${extraStyle || ''}`);
        ins.setAttribute('data-ad-client', ADSENSE_CONFIG.publisherId);
        ins.setAttribute('data-ad-slot', slotId);
        ins.setAttribute('data-ad-format', format || 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');

        wrapper.appendChild(ins);
        
        // Attach observer to hide/show box dynamically
        observeAdStatus(ins, wrapper);

        return wrapper;
    }

    function pushAd() {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.warn('AdSense Push Exception skipped safely:', e.message);
        }
    }

    function insertAdBefore(targetSelector, slotKey, format, style, className) {
        const target = document.querySelector(targetSelector);
        if (!target || !target.parentNode) return false;
        
        const adEl = createAdUnit(ADSENSE_CONFIG.slots[slotKey], format, style, className);
        if (!adEl) return false;
        
        target.parentNode.insertBefore(adEl, target);
        pushAd();
        return true;
    }

    function insertAdAfter(targetSelector, slotKey, format, style, className) {
        const target = document.querySelector(targetSelector);
        if (!target || !target.parentNode) return false;
        
        const adEl = createAdUnit(ADSENSE_CONFIG.slots[slotKey], format, style, className);
        if (!adEl) return false;
        
        target.parentNode.insertBefore(adEl, target.nextSibling);
        pushAd();
        return true;
    }

    function insertSidebarAds() {
        if (window.innerWidth < 1200) return;

        const toolWrapper = document.querySelector('.tool-wrapper') || document.querySelector('.files-area') || document.querySelector('.container main');
        if (!toolWrapper || !toolWrapper.parentNode) return;

        if (document.querySelector('.ad-sidebar-left')) return;

        const leftSidebar = createAdUnit(ADSENSE_CONFIG.slots.sidebar, 'vertical', 'width:160px;height:600px;', 'ad-sidebar ad-sidebar-left');
        const rightSidebar = createAdUnit(ADSENSE_CONFIG.slots.sidebar, 'vertical', 'width:160px;height:600px;', 'ad-sidebar ad-sidebar-right');

        toolWrapper.parentNode.style.position = 'relative';

        if (leftSidebar) {
            toolWrapper.parentNode.insertBefore(leftSidebar, toolWrapper);
            pushAd();
        }
        if (rightSidebar) {
            toolWrapper.parentNode.insertBefore(rightSidebar, toolWrapper.nextSibling);
            pushAd();
        }
    }

    function autoPlaceAds() {
        const isToolPage = !!document.querySelector('.tool-header, .tool-title, [data-section]');
        const isHomePage = !!document.querySelector('.tools-grid, .tool-cards-grid, [data-category]');

        if (isHomePage && !isToolPage) {
            insertAdAfter('.hero, .hero-section, .tool-header', 'topBanner', 'horizontal');
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }
        else if (isToolPage) {
            insertAdBefore('.tool-area', 'topBanner', 'horizontal');
            insertAdAfter('.tool-area', 'inArticle', 'auto');
            insertAdBefore('.faq-section', 'middleBanner', 'auto');
            insertAdBefore('footer, .footer', 'bottomBanner', 'auto');
        }

        insertSidebarAds();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoPlaceAds, 400);
        });
    } else {
        setTimeout(autoPlaceAds, 400);
    }

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const sidebars = document.querySelectorAll('.ad-sidebar');
            if (window.innerWidth < 1200) {
                sidebars.forEach(s => s.style.display = 'none');
            } else {
                if (sidebars.length === 0) {
                    insertSidebarAds();
                } else {
                    sidebars.forEach(s => {
                        s.style.display = ''; // Let CSS (.is-filled) handle the display 
                    });
                }
            }
        }, 300);
    });

})();