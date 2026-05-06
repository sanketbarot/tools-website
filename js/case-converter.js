// ==========================================
// CASE CONVERTER - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('textInput');
    if (textarea) {
        textarea.addEventListener('input', updateStats);
    }
});

// Update character/word count
function updateStats() {
    var text = document.getElementById('textInput').value;
    var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    var chars = text.length;
    document.getElementById('wordCount').textContent = words;
    document.getElementById('charCount').textContent = chars;
}

// ===== CONVERSIONS =====
function toUpperCase() {
    var text = getText();
    if (!text) return;
    setText(text.toUpperCase());
    showDone('UPPER CASE', 'All letters converted to uppercase');
}

function toLowerCase() {
    var text = getText();
    if (!text) return;
    setText(text.toLowerCase());
    showDone('lower case', 'All letters converted to lowercase');
}

function toTitleCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase().replace(/(?:^|\s|[-/])\S/g, function(match) {
        return match.toUpperCase();
    });
    setText(result);
    showDone('Title Case', 'First letter of each word capitalized');
}

function toSentenceCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function(match) {
        return match.toUpperCase();
    });
    setText(result);
    showDone('Sentence case', 'First letter of each sentence capitalized');
}

function toCapitalizeWords() {
    var text = getText();
    if (!text) return;
    var result = text.replace(/\b\w/g, function(match) {
        return match.toUpperCase();
    });
    setText(result);
    showDone('Capitalize Words', 'First letter of every word capitalized');
}

function toAlternatingCase() {
    var text = getText();
    if (!text) return;
    var result = '';
    for (var i = 0; i < text.length; i++) {
        result += i % 2 === 0 ? text[i].toLowerCase() : text[i].toUpperCase();
    }
    setText(result);
    showDone('aLtErNaTiNg CaSe', 'Alternating lowercase and uppercase');
}

function toInverseCase() {
    var text = getText();
    if (!text) return;
    var result = '';
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        result += ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase();
    }
    setText(result);
    showDone('iNVERSE cASE', 'Upper becomes lower, lower becomes upper');
}

function toCamelCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr) {
            return chr.toUpperCase();
        });
    // First letter lowercase
    result = result.charAt(0).toLowerCase() + result.slice(1);
    setText(result);
    showDone('camelCase', 'Words joined, first word lowercase');
}

function toPascalCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, function(match, chr) {
            return chr.toUpperCase();
        })
        .replace(/[^a-zA-Z0-9]/g, '');
    setText(result);
    showDone('PascalCase', 'Words joined, each word capitalized');
}

function toSnakeCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/_+/g, '_');
    setText(result);
    showDone('snake_case', 'Words separated by underscores');
}

function toKebabCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/-+/g, '-');
    setText(result);
    showDone('kebab-case', 'Words separated by hyphens');
}

function toDotCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-zA-Z0-9.]/g, '')
        .replace(/\.+/g, '.');
    setText(result);
    showDone('dot.case', 'Words separated by dots');
}

function toSlashCase() {
    var text = getText();
    if (!text) return;
    var result = text.toLowerCase()
        .replace(/\s+/g, '/')
        .replace(/[^a-zA-Z0-9/]/g, '')
        .replace(/\/+/g, '/');
    setText(result);
    showDone('path/case', 'Words separated by slashes');
}

function toConstantCase() {
    var text = getText();
    if (!text) return;
    var result = text.toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/_+/g, '_');
    setText(result);
    showDone('CONSTANT_CASE', 'Uppercase with underscores');
}

function removeExtraSpaces() {
    var text = getText();
    if (!text) return;
    var result = text.replace(/\s+/g, ' ').trim();
    setText(result);
    showDone('Spaces Cleaned', 'Extra spaces removed');
}

function removeLineBreaks() {
    var text = getText();
    if (!text) return;
    var result = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    setText(result);
    showDone('Line Breaks Removed', 'All text on single line');
}

function reverseText() {
    var text = getText();
    if (!text) return;
    var result = text.split('').reverse().join('');
    setText(result);
    showDone('desreveR', 'Text reversed character by character');
}

function reverseWords() {
    var text = getText();
    if (!text) return;
    var result = text.split(/\s+/).reverse().join(' ');
    setText(result);
    showDone('Words Reversed', 'Word order reversed');
}

// ===== HELPERS =====
function getText() {
    var text = document.getElementById('textInput').value;
    if (!text.trim()) {
        showE('Please enter some text first!');
        return null;
    }
    hideE();
    return text;
}

function setText(text) {
    document.getElementById('textInput').value = text;
    document.getElementById('outputPreview').textContent = text;
    document.getElementById('previewArea').style.display = 'block';
    updateStats();
}

function showDone(title, desc) {
    document.getElementById('convTitle').textContent = title;
    document.getElementById('convDesc').textContent = desc;
}

// Copy text
function copyText() {
    var text = document.getElementById('textInput').value;
    if (!text) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Text copied!'); });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Copied!');
    }
}

// Clear
function clearText() {
    document.getElementById('textInput').value = '';
    document.getElementById('previewArea').style.display = 'none';
    updateStats();
}

// Paste
function pasteText() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            document.getElementById('textInput').value = text;
            updateStats();
        });
    } else {
        document.getElementById('textInput').focus();
        alert('Press Ctrl+V to paste');
    }
}

// Download as txt
function downloadText() {
    var text = document.getElementById('textInput').value;
    if (!text) return;
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// Sample text
function loadSample() {
    document.getElementById('textInput').value = 'the quick brown fox jumps over the lazy dog. this is a sample text for testing case conversion. it contains multiple sentences and words.';
    updateStats();
}

// Error
function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 6000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('Case Converter loaded');