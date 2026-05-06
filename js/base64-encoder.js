// ==========================================
// BASE64 ENCODER/DECODER - COMPLETE WORKING
// ==========================================

var B64 = {
    mode: 'encode',
    lastResult: ''
};

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('textInput');
    if (input) {
        input.addEventListener('input', function() {
            updateInputStats();
            if (document.getElementById('autoConvert').checked) {
                convert();
            }
        });
    }
});

// Mode switch
function setMode(mode, el) {
    B64.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('on'); });
    el.classList.add('on');

    document.getElementById('inputLabel').textContent = mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode';
    document.getElementById('outputLabel').textContent = mode === 'encode' ? 'Base64 Output' : 'Decoded Text';
    document.getElementById('convertBtn').innerHTML = mode === 'encode'
        ? '<i class="fas fa-lock"></i> Encode to Base64'
        : '<i class="fas fa-unlock"></i> Decode from Base64';

    document.getElementById('textInput').placeholder = mode === 'encode'
        ? 'Enter text to encode to Base64...'
        : 'Paste Base64 string to decode...';

    // Clear output
    document.getElementById('outputBox').textContent = '';
    document.getElementById('resultSection').style.display = 'none';
}

// ===== CONVERT =====
function convert() {
    hideE();

    var input = document.getElementById('textInput').value;
    if (!input.trim()) {
        document.getElementById('outputBox').textContent = '';
        document.getElementById('resultSection').style.display = 'none';
        return;
    }

    var output = '';

    try {
        if (B64.mode === 'encode') {
            // Encode: Text → Base64
            output = textToBase64(input);
        } else {
            // Decode: Base64 → Text
            output = base64ToText(input.trim());
        }

        B64.lastResult = output;

        // Display
        document.getElementById('outputBox').textContent = output;

        // Stats
        var inputSize = new Blob([input]).size;
        var outputSize = new Blob([output]).size;
        var ratio = inputSize > 0 ? ((outputSize / inputSize) * 100).toFixed(0) : 0;

        document.getElementById('rInputSize').textContent = formatSize(inputSize);
        document.getElementById('rOutputSize').textContent = formatSize(outputSize);
        document.getElementById('rRatio').textContent = ratio + '%';

        if (B64.mode === 'encode') {
            document.getElementById('rDirection').textContent = 'Text → Base64';
            document.getElementById('rDiff').textContent = '+' + formatSize(outputSize - inputSize);
            document.getElementById('rDiff').style.color = '#f59e0b';
        } else {
            document.getElementById('rDirection').textContent = 'Base64 → Text';
            document.getElementById('rDiff').textContent = '-' + formatSize(inputSize - outputSize);
            document.getElementById('rDiff').style.color = '#22c55e';
        }

        document.getElementById('resultSection').style.display = 'block';

    } catch(e) {
        console.error('Convert error:', e);
        showE(B64.mode === 'encode'
            ? 'Encoding failed: ' + e.message
            : 'Invalid Base64 string! Please check your input.');
    }
}

// ===== ENCODE/DECODE FUNCTIONS =====
// Handles Unicode properly
function textToBase64(text) {
    var bytes = new TextEncoder().encode(text);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToText(base64) {
    // Clean input (remove whitespace/newlines)
    base64 = base64.replace(/\s/g, '');

    // Validate Base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
        throw new Error('Invalid Base64 characters detected');
    }

    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

// ===== URL SAFE BASE64 =====
function encodeURLSafe() {
    hideE();
    var input = document.getElementById('textInput').value;
    if (!input.trim()) { showE('Enter text first!'); return; }

    try {
        var base64 = textToBase64(input);
        // Replace + with -, / with _, remove =
        var urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        B64.lastResult = urlSafe;
        document.getElementById('outputBox').textContent = urlSafe;
        document.getElementById('resultSection').style.display = 'block';
        updateResultStats(input, urlSafe, 'URL-Safe Base64');
    } catch(e) {
        showE('Encoding failed: ' + e.message);
    }
}

// ===== FILE TO BASE64 =====
function encodeFile() {
    document.getElementById('fileInput').click();
}

document.addEventListener('DOMContentLoaded', function() {
    var fi = document.getElementById('fileInput');
    if (fi) {
        fi.addEventListener('change', function() {
            if (fi.files && fi.files[0]) {
                var file = fi.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    var base64 = e.target.result;
                    // Remove data URL prefix
                    var pure = base64.split(',')[1] || base64;

                    B64.lastResult = pure;
                    document.getElementById('outputBox').textContent = pure;

                    // Show data URL too
                    document.getElementById('dataUrlBox').textContent = base64;
                    document.getElementById('dataUrlSection').style.display = 'block';

                    // File info
                    document.getElementById('fileInfo').innerHTML =
                        '<strong>' + escH(file.name) + '</strong> (' + formatSize(file.size) + ') → Base64: ' + formatSize(pure.length);
                    document.getElementById('fileInfo').style.display = 'block';

                    document.getElementById('resultSection').style.display = 'block';
                    updateResultStats(file.name, pure, 'File → Base64');
                };
                reader.readAsDataURL(file);
            }
            fi.value = '';
        });
    }
});

// ===== IMAGE PREVIEW =====
function previewAsImage() {
    hideE();
    var base64 = document.getElementById('textInput').value.trim();
    if (!base64) { showE('Enter Base64 string first!'); return; }

    var imgPreview = document.getElementById('imgPreview');
    var imgEl = document.getElementById('previewImg');

    // Check if it's a data URL or raw base64
    var src = base64;
    if (!base64.startsWith('data:')) {
        // Try as image
        src = 'data:image/png;base64,' + base64;
    }

    imgEl.onerror = function() {
        imgPreview.style.display = 'none';
        showE('This Base64 string is not a valid image.');
    };

    imgEl.onload = function() {
        imgPreview.style.display = 'block';
        document.getElementById('imgInfo').textContent = imgEl.naturalWidth + '×' + imgEl.naturalHeight + ' px';
    };

    imgEl.src = src;
}

// ===== UTILITIES =====
function updateInputStats() {
    var text = document.getElementById('textInput').value;
    var size = new Blob([text]).size;
    document.getElementById('inputSize').textContent = formatSize(size);
    document.getElementById('inputChars').textContent = text.length;
}

function updateResultStats(input, output, direction) {
    var inputSize = typeof input === 'string' ? new Blob([input]).size : 0;
    var outputSize = new Blob([output]).size;
    document.getElementById('rInputSize').textContent = formatSize(inputSize);
    document.getElementById('rOutputSize').textContent = formatSize(outputSize);
    document.getElementById('rDirection').textContent = direction;
    document.getElementById('rRatio').textContent = inputSize > 0 ? ((outputSize / inputSize) * 100).toFixed(0) + '%' : '-';
    document.getElementById('rDiff').textContent = formatSize(Math.abs(outputSize - inputSize));
    document.getElementById('rDiff').style.color = outputSize > inputSize ? '#f59e0b' : '#22c55e';
}

// Copy
function copyOutput() {
    copyVal(document.getElementById('outputBox').textContent, 'Output copied!');
}

function copyDataUrl() {
    copyVal(document.getElementById('dataUrlBox').textContent, 'Data URL copied!');
}

function copyInput() {
    copyVal(document.getElementById('textInput').value, 'Input copied!');
}

function copyVal(text, msg) {
    if (!text) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { showCopied(msg); });
    } else { prompt('Copy:', text); }
}

function showCopied(msg) {
    var el = document.getElementById('copiedMsg');
    el.textContent = '✅ ' + (msg || 'Copied!');
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 1500);
}

// Swap input/output
function swapIO() {
    var output = document.getElementById('outputBox').textContent;
    if (!output) return;
    document.getElementById('textInput').value = output;
    B64.mode = B64.mode === 'encode' ? 'decode' : 'encode';

    var btns = document.querySelectorAll('.mode-btn');
    btns.forEach(function(b) { b.classList.remove('on'); });
    var target = B64.mode === 'encode' ? btns[0] : btns[1];
    if (target) target.classList.add('on');

    setMode(B64.mode, target);
    updateInputStats();
    convert();
}

// Clear
function clearAll() {
    document.getElementById('textInput').value = '';
    document.getElementById('outputBox').textContent = '';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('dataUrlSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('imgPreview').style.display = 'none';
    B64.lastResult = '';
    updateInputStats();
}

// Paste
function pasteText() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            document.getElementById('textInput').value = text;
            updateInputStats();
            if (document.getElementById('autoConvert').checked) convert();
        });
    } else {
        document.getElementById('textInput').focus();
    }
}

// Download
function downloadOutput() {
    var text = document.getElementById('outputBox').textContent;
    if (!text) return;
    var ext = B64.mode === 'encode' ? '.b64' : '.txt';
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    dlBlob(blob, 'base64-output' + ext);
}

function dlBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// Load sample
function loadSample() {
    if (B64.mode === 'encode') {
        document.getElementById('textInput').value = 'Hello World! This is a sample text for Base64 encoding. It supports Unicode: 你好世界 🌍';
    } else {
        document.getElementById('textInput').value = 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBzYW1wbGUgdGV4dCBmb3IgQmFzZTY0IGVuY29kaW5nLg==';
    }
    updateInputStats();
}

// Format size
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function escH(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 8000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('Base64 Encoder loaded');