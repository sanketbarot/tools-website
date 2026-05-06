// ==========================================
// COLOR PICKER - COMPLETE WORKING
// ==========================================

var CP = {
    h: 0, s: 100, l: 50,
    r: 255, g: 0, b: 0,
    hex: '#ff0000',
    history: []
};

document.addEventListener('DOMContentLoaded', function() {
    // Main color input
    var picker = document.getElementById('mainPicker');
    if (picker) {
        picker.addEventListener('input', function() {
            setFromHex(this.value);
        });
    }

    // Hex input
    var hexInput = document.getElementById('hexInput');
    if (hexInput) {
        hexInput.addEventListener('change', function() {
            var val = this.value.trim();
            if (val.charAt(0) !== '#') val = '#' + val;
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                setFromHex(val);
            }
        });
    }

    // RGB inputs
    ['rInput', 'gInput', 'bInput'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function() { updateFromRGB(); });
    });

    // HSL inputs
    ['hInput', 'sInput', 'lInput'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function() { updateFromHSL(); });
    });

    // Init
    setFromHex('#6366f1');
    generatePalette('analogous');
});

// ===== SET FROM HEX =====
function setFromHex(hex) {
    hex = hex.toLowerCase();
    CP.hex = hex;

    var rgb = hexToRgb(hex);
    CP.r = rgb.r; CP.g = rgb.g; CP.b = rgb.b;

    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    CP.h = hsl.h; CP.s = hsl.s; CP.l = hsl.l;

    updateAllDisplays();
}

// ===== UPDATE FROM RGB =====
function updateFromRGB() {
    CP.r = clamp(parseInt(document.getElementById('rInput').value) || 0, 0, 255);
    CP.g = clamp(parseInt(document.getElementById('gInput').value) || 0, 0, 255);
    CP.b = clamp(parseInt(document.getElementById('bInput').value) || 0, 0, 255);

    CP.hex = rgbToHex(CP.r, CP.g, CP.b);
    var hsl = rgbToHsl(CP.r, CP.g, CP.b);
    CP.h = hsl.h; CP.s = hsl.s; CP.l = hsl.l;

    updateAllDisplays();
}

// ===== UPDATE FROM HSL =====
function updateFromHSL() {
    CP.h = clamp(parseInt(document.getElementById('hInput').value) || 0, 0, 360);
    CP.s = clamp(parseInt(document.getElementById('sInput').value) || 0, 0, 100);
    CP.l = clamp(parseInt(document.getElementById('lInput').value) || 0, 0, 100);

    var rgb = hslToRgb(CP.h, CP.s, CP.l);
    CP.r = rgb.r; CP.g = rgb.g; CP.b = rgb.b;
    CP.hex = rgbToHex(CP.r, CP.g, CP.b);

    updateAllDisplays();
}

// ===== UPDATE ALL DISPLAYS =====
function updateAllDisplays() {
    // Color picker
    document.getElementById('mainPicker').value = CP.hex;

    // Preview
    document.getElementById('colorPreview').style.background = CP.hex;
    document.getElementById('previewText').style.color = isLight(CP.r, CP.g, CP.b) ? '#000' : '#fff';

    // HEX
    document.getElementById('hexInput').value = CP.hex;
    document.getElementById('hexDisplay').textContent = CP.hex.toUpperCase();

    // RGB
    document.getElementById('rInput').value = CP.r;
    document.getElementById('gInput').value = CP.g;
    document.getElementById('bInput').value = CP.b;
    document.getElementById('rgbDisplay').textContent = 'rgb(' + CP.r + ', ' + CP.g + ', ' + CP.b + ')';

    // HSL
    document.getElementById('hInput').value = Math.round(CP.h);
    document.getElementById('sInput').value = Math.round(CP.s);
    document.getElementById('lInput').value = Math.round(CP.l);
    document.getElementById('hslDisplay').textContent = 'hsl(' + Math.round(CP.h) + ', ' + Math.round(CP.s) + '%, ' + Math.round(CP.l) + '%)';

    // CMYK
    var cmyk = rgbToCmyk(CP.r, CP.g, CP.b);
    document.getElementById('cmykDisplay').textContent = 'cmyk(' + cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%)';

    // CSS
    document.getElementById('cssHex').textContent = 'color: ' + CP.hex + ';';
    document.getElementById('cssRgb').textContent = 'color: rgb(' + CP.r + ', ' + CP.g + ', ' + CP.b + ');';
    document.getElementById('cssHsl').textContent = 'color: hsl(' + Math.round(CP.h) + ', ' + Math.round(CP.s) + '%, ' + Math.round(CP.l) + '%);';

    // Contrast info
    var lum = getLuminance(CP.r, CP.g, CP.b);
    var contrastBlack = (lum + 0.05) / 0.05;
    var contrastWhite = 1.05 / (lum + 0.05);
    document.getElementById('contrastBlack').textContent = contrastBlack.toFixed(1) + ':1';
    document.getElementById('contrastWhite').textContent = contrastWhite.toFixed(1) + ':1';
    document.getElementById('contrastBlack').style.color = contrastBlack >= 4.5 ? '#22c55e' : '#ef4444';
    document.getElementById('contrastWhite').style.color = contrastWhite >= 4.5 ? '#22c55e' : '#ef4444';

    // Tints & Shades
    generateTintsShades();
}

// ===== TINTS & SHADES =====
function generateTintsShades() {
    var tintsEl = document.getElementById('tintsList');
    var shadesEl = document.getElementById('shadesList');
    tintsEl.innerHTML = '';
    shadesEl.innerHTML = '';

    for (var i = 0; i <= 9; i++) {
        var factor = i / 9;

        // Tint (mix with white)
        var tr = Math.round(CP.r + (255 - CP.r) * factor);
        var tg = Math.round(CP.g + (255 - CP.g) * factor);
        var tb = Math.round(CP.b + (255 - CP.b) * factor);
        var tHex = rgbToHex(tr, tg, tb);

        var tDiv = document.createElement('div');
        tDiv.className = 'ts-swatch';
        tDiv.style.background = tHex;
        tDiv.title = tHex;
        tDiv.onclick = (function(h) { return function() { setFromHex(h); }; })(tHex);
        tintsEl.appendChild(tDiv);

        // Shade (mix with black)
        var sr = Math.round(CP.r * (1 - factor));
        var sg = Math.round(CP.g * (1 - factor));
        var sb = Math.round(CP.b * (1 - factor));
        var sHex = rgbToHex(sr, sg, sb);

        var sDiv = document.createElement('div');
        sDiv.className = 'ts-swatch';
        sDiv.style.background = sHex;
        sDiv.title = sHex;
        sDiv.onclick = (function(h) { return function() { setFromHex(h); }; })(sHex);
        shadesEl.appendChild(sDiv);
    }
}

// ===== PALETTE GENERATOR =====
function generatePalette(type) {
    document.querySelectorAll('.pal-btn').forEach(function(b) { b.classList.remove('on'); });
    if (event && event.target) {
        var btn = event.target.closest('.pal-btn');
        if (btn) btn.classList.add('on');
    }

    var colors = [];
    var h = CP.h, s = CP.s, l = CP.l;

    switch (type) {
        case 'analogous':
            for (var i = -2; i <= 2; i++) colors.push(hslToHex((h + i * 30 + 360) % 360, s, l));
            break;
        case 'complementary':
            colors.push(CP.hex);
            colors.push(hslToHex((h + 180) % 360, s, l));
            colors.push(hslToHex((h + 150) % 360, s, l));
            colors.push(hslToHex((h + 210) % 360, s, l));
            colors.push(hslToHex(h, s, clamp(l - 20, 0, 100)));
            break;
        case 'triadic':
            colors.push(CP.hex);
            colors.push(hslToHex((h + 120) % 360, s, l));
            colors.push(hslToHex((h + 240) % 360, s, l));
            colors.push(hslToHex(h, clamp(s - 20, 0, 100), l));
            colors.push(hslToHex(h, s, clamp(l + 15, 0, 100)));
            break;
        case 'split':
            colors.push(CP.hex);
            colors.push(hslToHex((h + 150) % 360, s, l));
            colors.push(hslToHex((h + 210) % 360, s, l));
            colors.push(hslToHex(h, s, clamp(l - 15, 0, 100)));
            colors.push(hslToHex(h, s, clamp(l + 15, 0, 100)));
            break;
        case 'monochromatic':
            for (var i = 0; i < 5; i++) colors.push(hslToHex(h, s, clamp(20 + i * 15, 0, 100)));
            break;
        case 'random':
            for (var i = 0; i < 5; i++) colors.push(hslToHex(Math.floor(Math.random() * 360), 60 + Math.floor(Math.random() * 30), 40 + Math.floor(Math.random() * 30)));
            break;
    }

    var grid = document.getElementById('paletteGrid');
    grid.innerHTML = '';
    for (var i = 0; i < colors.length; i++) {
        var div = document.createElement('div');
        div.className = 'pal-color';
        div.style.background = colors[i];
        div.innerHTML = '<span class="pal-hex" style="color:' + (isLightHex(colors[i]) ? '#000' : '#fff') + ';">' + colors[i].toUpperCase() + '</span>';
        div.onclick = (function(c) { return function() { setFromHex(c); }; })(colors[i]);
        grid.appendChild(div);
    }
}

// ===== COPY FUNCTIONS =====
function copyHex() { copyVal(CP.hex.toUpperCase()); }
function copyRgb() { copyVal('rgb(' + CP.r + ', ' + CP.g + ', ' + CP.b + ')'); }
function copyHsl() { copyVal('hsl(' + Math.round(CP.h) + ', ' + Math.round(CP.s) + '%, ' + Math.round(CP.l) + '%)'); }
function copyCss(type) {
    var text = document.getElementById('css' + type).textContent;
    copyVal(text);
}

function copyVal(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { showCopied(); });
    } else { prompt('Copy:', text); }
}

function showCopied() {
    var el = document.getElementById('copiedMsg');
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 1500);
}

// ===== ADD TO HISTORY =====
function addToHistory() {
    if (CP.history.indexOf(CP.hex) === -1) {
        CP.history.unshift(CP.hex);
        if (CP.history.length > 20) CP.history.pop();
        renderHistory();
    }
}

function renderHistory() {
    var el = document.getElementById('historyGrid');
    el.innerHTML = '';
    for (var i = 0; i < CP.history.length; i++) {
        var div = document.createElement('div');
        div.className = 'hist-swatch';
        div.style.background = CP.history[i];
        div.title = CP.history[i];
        div.onclick = (function(h) { return function() { setFromHex(h); }; })(CP.history[i]);
        el.appendChild(div);
    }
}

// ===== RANDOM COLOR =====
function randomColor() {
    var hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setFromHex(hex);
}

// ===== COLOR CONVERSIONS =====
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function(x) {
        return x.toString(16).padStart(2, '0');
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min) { h = s = 0; }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;

    if (s === 0) { r = g = b = l; }
    else {
        var hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hslToHex(h, s, l) {
    var rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
    var c = 1 - (r / 255), m = 1 - (g / 255), y = 1 - (b / 255);
    var k = Math.min(c, m, y);
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    return { c: c, m: m, y: y, k: k };
}

function getLuminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function isLight(r, g, b) { return getLuminance(r, g, b) > 0.5; }
function isLightHex(hex) { var rgb = hexToRgb(hex); return isLight(rgb.r, rgb.g, rgb.b); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

console.log('Color Picker loaded');