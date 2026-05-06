// ==========================================
// JSON FORMATTER - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('jsonInput');
    if (input) {
        input.addEventListener('input', function() {
            updateStats();
        });
    }
});

// ===== FORMAT / BEAUTIFY =====
function formatJSON() {
    hideE();
    var input = document.getElementById('jsonInput').value.trim();
    if (!input) { showE('Please enter JSON data!'); return; }

    try {
        var parsed = JSON.parse(input);
        var indent = parseInt(document.getElementById('indentSize').value) || 2;
        var formatted = JSON.stringify(parsed, null, indent);

        document.getElementById('jsonOutput').textContent = formatted;
        showResult('Formatted (Beautified)', formatted, 'format');
    } catch(e) {
        showE('Invalid JSON: ' + e.message);
        highlightError(input, e.message);
    }
}

// ===== MINIFY =====
function minifyJSON() {
    hideE();
    var input = document.getElementById('jsonInput').value.trim();
    if (!input) { showE('Please enter JSON data!'); return; }

    try {
        var parsed = JSON.parse(input);
        var minified = JSON.stringify(parsed);

        document.getElementById('jsonOutput').textContent = minified;
        showResult('Minified', minified, 'minify');
    } catch(e) {
        showE('Invalid JSON: ' + e.message);
    }
}

// ===== VALIDATE =====
function validateJSON() {
    hideE();
    var input = document.getElementById('jsonInput').value.trim();
    if (!input) { showE('Please enter JSON data!'); return; }

    try {
        var parsed = JSON.parse(input);
        var type = Array.isArray(parsed) ? 'Array' : typeof parsed;
        var keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;

        document.getElementById('validIcon').innerHTML = '<i class="fas fa-check-circle" style="color:#22c55e;font-size:50px;"></i>';
        document.getElementById('validTitle').textContent = '✅ Valid JSON!';
        document.getElementById('validTitle').style.color = '#22c55e';
        document.getElementById('validDetails').innerHTML =
            '<div class="vd-row"><span>Type:</span><strong>' + type.charAt(0).toUpperCase() + type.slice(1) + '</strong></div>' +
            '<div class="vd-row"><span>Top-level keys:</span><strong>' + keys + '</strong></div>' +
            '<div class="vd-row"><span>Size:</span><strong>' + formatSize(input.length) + '</strong></div>';

        document.getElementById('validateSection').style.display = 'block';
        document.getElementById('validateSection').scrollIntoView({ behavior: 'smooth' });

    } catch(e) {
        document.getElementById('validIcon').innerHTML = '<i class="fas fa-times-circle" style="color:#ef4444;font-size:50px;"></i>';
        document.getElementById('validTitle').textContent = '❌ Invalid JSON';
        document.getElementById('validTitle').style.color = '#ef4444';
        document.getElementById('validDetails').innerHTML =
            '<div class="vd-row" style="color:#ef4444;"><span>Error:</span><strong>' + escH(e.message) + '</strong></div>';

        document.getElementById('validateSection').style.display = 'block';
        highlightError(input, e.message);
    }
}

// ===== TREE VIEW =====
function showTreeView() {
    hideE();
    var input = document.getElementById('jsonInput').value.trim();
    if (!input) { showE('Please enter JSON data!'); return; }

    try {
        var parsed = JSON.parse(input);
        var tree = buildTree(parsed, '');

        document.getElementById('treeContent').innerHTML = tree;
        document.getElementById('treeSection').style.display = 'block';
        document.getElementById('treeSection').scrollIntoView({ behavior: 'smooth' });

    } catch(e) {
        showE('Invalid JSON: ' + e.message);
    }
}

// Build tree HTML
function buildTree(obj, path) {
    var html = '<ul class="tree-list">';

    if (obj === null) {
        html += '<li class="tree-item"><span class="tree-val null">null</span></li>';
    } else if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            var childPath = path + '[' + i + ']';
            html += '<li class="tree-item">';
            html += '<span class="tree-key">[' + i + ']</span>';

            if (typeof obj[i] === 'object' && obj[i] !== null) {
                html += '<span class="tree-toggle" onclick="toggleTreeNode(this)">▼</span>';
                html += '<span class="tree-type">' + (Array.isArray(obj[i]) ? 'Array[' + obj[i].length + ']' : 'Object{' + Object.keys(obj[i]).length + '}') + '</span>';
                html += '<div class="tree-children">' + buildTree(obj[i], childPath) + '</div>';
            } else {
                html += ': ' + formatValue(obj[i]);
            }
            html += '</li>';
        }
    } else if (typeof obj === 'object') {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = obj[key];
            var childPath = path + '.' + key;

            html += '<li class="tree-item">';
            html += '<span class="tree-key">"' + escH(key) + '"</span>';

            if (typeof val === 'object' && val !== null) {
                html += '<span class="tree-toggle" onclick="toggleTreeNode(this)">▼</span>';
                html += '<span class="tree-type">' + (Array.isArray(val) ? 'Array[' + val.length + ']' : 'Object{' + Object.keys(val).length + '}') + '</span>';
                html += '<div class="tree-children">' + buildTree(val, childPath) + '</div>';
            } else {
                html += ': ' + formatValue(val);
            }
            html += '</li>';
        }
    }

    html += '</ul>';
    return html;
}

function formatValue(val) {
    if (val === null) return '<span class="tree-val null">null</span>';
    if (typeof val === 'string') return '<span class="tree-val string">"' + escH(val) + '"</span>';
    if (typeof val === 'number') return '<span class="tree-val number">' + val + '</span>';
    if (typeof val === 'boolean') return '<span class="tree-val boolean">' + val + '</span>';
    return '<span class="tree-val">' + escH(String(val)) + '</span>';
}

function toggleTreeNode(el) {
    var children = el.parentElement.querySelector('.tree-children');
    if (children) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            el.textContent = '▼';
        } else {
            children.style.display = 'none';
            el.textContent = '▶';
        }
    }
}

// ===== CONVERT TO OTHER FORMATS =====
function convertTo(format) {
    hideE();
    var input = document.getElementById('jsonInput').value.trim();
    if (!input) { showE('Please enter JSON data!'); return; }

    try {
        var parsed = JSON.parse(input);
        var output = '';

        if (format === 'csv') {
            output = jsonToCSV(parsed);
        } else if (format === 'yaml') {
            output = jsonToYAML(parsed, 0);
        } else if (format === 'xml') {
            output = jsonToXML(parsed, 'root', 0);
        }

        document.getElementById('convertOutput').textContent = output;
        document.getElementById('convertFormat').textContent = format.toUpperCase();
        document.getElementById('convertSection').style.display = 'block';
        document.getElementById('convertSection').scrollIntoView({ behavior: 'smooth' });

    } catch(e) {
        showE('Invalid JSON: ' + e.message);
    }
}

// JSON to CSV
function jsonToCSV(data) {
    if (!Array.isArray(data)) {
        if (typeof data === 'object') data = [data];
        else return String(data);
    }
    if (data.length === 0) return '';

    var keys = Object.keys(data[0]);
    var csv = keys.join(',') + '\n';
    for (var i = 0; i < data.length; i++) {
        var row = keys.map(function(k) {
            var val = data[i][k];
            if (val === null || val === undefined) return '';
            val = String(val);
            if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1) {
                val = '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        });
        csv += row.join(',') + '\n';
    }
    return csv;
}

// JSON to YAML (simple)
function jsonToYAML(obj, indent) {
    var spaces = '  '.repeat(indent);
    var yaml = '';

    if (obj === null) return 'null\n';
    if (typeof obj !== 'object') return String(obj) + '\n';

    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object' && obj[i] !== null) {
                yaml += spaces + '-\n' + jsonToYAML(obj[i], indent + 1);
            } else {
                yaml += spaces + '- ' + formatYAMLValue(obj[i]) + '\n';
            }
        }
    } else {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var val = obj[keys[i]];
            if (typeof val === 'object' && val !== null) {
                yaml += spaces + keys[i] + ':\n' + jsonToYAML(val, indent + 1);
            } else {
                yaml += spaces + keys[i] + ': ' + formatYAMLValue(val) + '\n';
            }
        }
    }
    return yaml;
}

function formatYAMLValue(val) {
    if (val === null) return 'null';
    if (typeof val === 'string') return '"' + val + '"';
    return String(val);
}

// JSON to XML (simple)
function jsonToXML(obj, rootName, indent) {
    var spaces = '  '.repeat(indent);
    var xml = '';

    if (indent === 0) xml += '<?xml version="1.0" encoding="UTF-8"?>\n';

    if (Array.isArray(obj)) {
        xml += spaces + '<' + rootName + '>\n';
        for (var i = 0; i < obj.length; i++) {
            xml += jsonToXML(obj[i], 'item', indent + 1);
        }
        xml += spaces + '</' + rootName + '>\n';
    } else if (typeof obj === 'object' && obj !== null) {
        xml += spaces + '<' + rootName + '>\n';
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var val = obj[keys[i]];
            if (typeof val === 'object' && val !== null) {
                xml += jsonToXML(val, keys[i], indent + 1);
            } else {
                xml += spaces + '  <' + keys[i] + '>' + escXml(String(val === null ? '' : val)) + '</' + keys[i] + '>\n';
            }
        }
        xml += spaces + '</' + rootName + '>\n';
    } else {
        xml += spaces + '<' + rootName + '>' + escXml(String(obj)) + '</' + rootName + '>\n';
    }

    return xml;
}

// Show result
function showResult(title, output, type) {
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('jsonOutput').textContent = output;

    // Size comparison
    var orig = document.getElementById('jsonInput').value.length;
    var result = output.length;
    var diff = result - orig;
    var diffText = diff > 0 ? '+' + formatSize(diff) : '-' + formatSize(Math.abs(diff));

    document.getElementById('rOrigSize').textContent = formatSize(orig);
    document.getElementById('rNewSize').textContent = formatSize(result);
    document.getElementById('rDiff').textContent = diffText;
    document.getElementById('rDiff').style.color = diff > 0 ? '#f59e0b' : '#22c55e';

    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// Highlight error position
function highlightError(input, message) {
    var posMatch = message.match(/position\s+(\d+)/i) || message.match(/column\s+(\d+)/i);
    if (posMatch) {
        var pos = parseInt(posMatch[1]);
        document.getElementById('errorPos').textContent = 'Error near position ' + pos;
        document.getElementById('errorPos').style.display = 'block';
    }
}

// ===== COPY & DOWNLOAD =====
function copyOutput() {
    var text = document.getElementById('jsonOutput').textContent;
    copyVal(text, 'JSON copied!');
}

function copyInput() {
    var text = document.getElementById('jsonInput').value;
    copyVal(text, 'Input copied!');
}

function copyConvert() {
    var text = document.getElementById('convertOutput').textContent;
    copyVal(text, 'Converted text copied!');
}

function copyVal(text, msg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showCopied(msg);
        });
    } else { prompt('Copy:', text); }
}

function showCopied(msg) {
    var el = document.getElementById('copiedMsg');
    el.textContent = '✅ ' + (msg || 'Copied!');
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 1500);
}

function downloadOutput(format) {
    var text = '';
    var ext = '.json';
    var mime = 'application/json';

    if (format === 'convert') {
        text = document.getElementById('convertOutput').textContent;
        ext = '.' + (document.getElementById('convertFormat').textContent || 'txt').toLowerCase();
        mime = 'text/plain';
    } else {
        text = document.getElementById('jsonOutput').textContent;
    }

    if (!text) return;
    var blob = new Blob([text], { type: mime + ';charset=utf-8' });
    dlBlob(blob, 'data' + ext);
}

function dlBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// ===== UTILITIES =====
function clearAll() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('validateSection').style.display = 'none';
    document.getElementById('treeSection').style.display = 'none';
    document.getElementById('convertSection').style.display = 'none';
    document.getElementById('errorPos').style.display = 'none';
    updateStats();
}

function loadSample() {
    var sample = {
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com",
        "isActive": true,
        "address": {
            "street": "123 Main St",
            "city": "New York",
            "country": "USA",
            "zip": "10001"
        },
        "hobbies": ["coding", "reading", "gaming"],
        "scores": [95, 87, 92, 78],
        "metadata": null
    };
    document.getElementById('jsonInput').value = JSON.stringify(sample, null, 2);
    updateStats();
}

function pasteJSON() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            document.getElementById('jsonInput').value = text;
            updateStats();
        });
    } else {
        document.getElementById('jsonInput').focus();
    }
}

function useOutput() {
    var output = document.getElementById('jsonOutput').textContent;
    if (output) {
        document.getElementById('jsonInput').value = output;
        updateStats();
    }
}

function updateStats() {
    var text = document.getElementById('jsonInput').value;
    document.getElementById('inputSize').textContent = formatSize(text.length);
    document.getElementById('inputLines').textContent = text ? text.split('\n').length : 0;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
}

function escH(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }
function escXml(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 8000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('JSON Formatter loaded');