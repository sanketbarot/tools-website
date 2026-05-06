// ==========================================
// AI SUMMARIZER - FIXED PDF SELECT
// ==========================================

// PDF.js init
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js OK');
} catch(e) { console.error(e); }

// State
var S = {
    mode: 'pdf',
    rawBytes: null,
    name: 'document',
    fullText: '',
    pages: 0,
    len: 'medium',
    sumText: '',
    sumHtml: '',
    keyParts: []
};

// Stop words
var STOPS = {};
'the is at which on a an and or but in to for of with it this that was are be has had have will would could should may can do does did been being not no from by as if then than so such very just also about up out into over after its their our your my his her we they he she i you me us them what who how when where why all each every both few more most other some any many much own same new old one two three first last long great little only still well back even here there now'.split(' ').forEach(function(w) { STOPS[w] = 1; });

// ===== FILE INPUT - FIXED =====
// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function() {
    var fi = document.getElementById('fi');
    var pickBtn = document.getElementById('pickBtn');
    var pdfUploadArea = document.getElementById('pdfUploadArea');

    console.log('DOM ready, fi:', !!fi, 'pickBtn:', !!pickBtn);

    // Button click
    if (pickBtn) {
        pickBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Pick button clicked');
            fi.click();
        });
    }

    // Upload area click (not on button)
    if (pdfUploadArea) {
        pdfUploadArea.addEventListener('click', function(e) {
            // Only trigger if not clicking button
            if (e.target === pickBtn || pickBtn.contains(e.target)) return;
            console.log('Upload area clicked');
            fi.click();
        });
    }

    // File input change
    if (fi) {
        fi.addEventListener('change', function() {
            console.log('File input changed, files:', fi.files.length);
            if (fi.files && fi.files[0]) {
                loadPDF(fi.files[0]);
            }
            fi.value = '';
        });
    }

    // Drag and drop
    if (pdfUploadArea) {
        pdfUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            pdfUploadArea.style.borderColor = '#9333ea';
            pdfUploadArea.style.background = 'rgba(168,85,247,0.05)';
        });
        pdfUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            pdfUploadArea.style.borderColor = 'rgba(168,85,247,0.25)';
            pdfUploadArea.style.background = '';
        });
        pdfUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            pdfUploadArea.style.borderColor = 'rgba(168,85,247,0.25)';
            pdfUploadArea.style.background = '';
            if (e.dataTransfer.files[0]) loadPDF(e.dataTransfer.files[0]);
        });
    }
});

// ===== INPUT MODE SWITCH =====
function switchInput(mode) {
    S.mode = mode;
    var tabPdf = document.getElementById('tabPdf');
    var tabText = document.getElementById('tabText');
    var pdfMode = document.getElementById('pdfMode');
    var textMode = document.getElementById('textMode');

    if (tabPdf) tabPdf.className = 'input-tab' + (mode === 'pdf' ? ' on' : '');
    if (tabText) tabText.className = 'input-tab' + (mode === 'text' ? ' on' : '');
    if (pdfMode) pdfMode.style.display = mode === 'pdf' ? 'block' : 'none';
    if (textMode) textMode.style.display = mode === 'text' ? 'block' : 'none';
}

// Summary length
function pickLen(len, el) {
    S.len = len;
    document.querySelectorAll('.len-card').forEach(function(c) { c.classList.remove('on'); });
    el.classList.add('on');
}

// ===== LOAD PDF =====
async function loadPDF(file) {
    hideE();
    console.log('Loading PDF:', file.name, file.size, file.type);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showE('Please select a PDF file!');
        return;
    }

    S.name = file.name.replace(/\.pdf$/i, '');

    try {
        // Read file
        console.log('Reading file buffer...');
        var ab = await readBuf(file);
        S.rawBytes = new Uint8Array(ab);
        console.log('Buffer ready, bytes:', S.rawBytes.length);

        // Load with PDF.js - FRESH COPY
        console.log('Loading with PDF.js...');
        var freshCopy = S.rawBytes.slice(0);
        var pdf = await pdfjsLib.getDocument({ data: freshCopy }).promise;
        S.pages = pdf.numPages;
        console.log('PDF loaded, pages:', S.pages);

        // Extract text
        console.log('Extracting text...');
        S.fullText = '';
        for (var i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var content = await page.getTextContent();
            var txt = '';
            var lastY = null;

            for (var j = 0; j < content.items.length; j++) {
                var item = content.items[j];
                if (item.str === undefined) continue;
                var y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 3) txt += '\n';
                else if (txt.length > 0 && item.str.length > 0) txt += ' ';
                txt += item.str;
                lastY = y;
            }
            S.fullText += txt.trim() + '\n\n';
        }
        S.fullText = S.fullText.trim();

        var wc = countWords(S.fullText);
        console.log('Text extracted, words:', wc);

        if (wc < 10) {
            showE('Very little text found. PDF may be scanned - try OCR tool first.');
        }

        // Update UI
        document.getElementById('fn').textContent = file.name;
        document.getElementById('fs').textContent = fmtSz(file.size);
        document.getElementById('fp').textContent = S.pages;
        document.getElementById('fw').textContent = wc.toLocaleString();
        document.getElementById('fInfo').style.display = 'block';

        console.log('PDF loaded successfully!');

    } catch(e) {
        console.error('PDF load error:', e);
        showE('Cannot read PDF: ' + e.message);
    }
}

function clearFile() {
    S.rawBytes = null;
    S.fullText = '';
    S.pages = 0;
    document.getElementById('fInfo').style.display = 'none';
    var fi = document.getElementById('fi');
    if (fi) fi.value = '';
}

function readBuf(f) {
    return new Promise(function(ok, fail) {
        var r = new FileReader();
        r.onload = function() {
            console.log('FileReader complete');
            ok(r.result);
        };
        r.onerror = function() {
            console.error('FileReader error');
            fail(new Error('Read failed'));
        };
        r.readAsArrayBuffer(f);
    });
}

// ==========================================
// ✅ SUMMARIZE
// ==========================================
async function doSummarize() {
    hideE();
    console.log('Starting summarization, mode:', S.mode);

    // Get text
    var text = '';
    if (S.mode === 'pdf') {
        text = S.fullText;
        console.log('Using PDF text, length:', text.length);
    } else {
        var txtEl = document.getElementById('txtInput');
        if (txtEl) text = txtEl.value.trim();
        console.log('Using pasted text, length:', text.length);
    }

    if (!text || text.length < 50) {
        showE('Please provide more text (minimum 50 characters). ' +
              (S.mode === 'pdf' ? 'Upload a PDF first.' : 'Paste text above.'));
        return;
    }

    goTo('s2');

    try {
        setProg(10, 'Analyzing text...', 'Preprocessing');
        await delay(300);

        // Clean text
        var clean = text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();

        // Split into sentences
        var rawSentences = clean.split(/(?<=[.!?])\s+/);
        var sentences = [];
        for (var i = 0; i < rawSentences.length; i++) {
            var s = rawSentences[i].trim();
            if (s.length > 15 && s.split(/\s+/).length >= 4) {
                sentences.push(s);
            }
        }

        console.log('Sentences:', sentences.length);

        if (sentences.length < 3) {
            goTo('s1');
            showE('Need at least 3 sentences for a meaningful summary. Found: ' + sentences.length);
            return;
        }

        setProg(30, 'Computing word importance...', 'TF-IDF');
        await delay(200);

        // TF-IDF
        var docFreq = {};
        var termFreqs = [];

        for (var i = 0; i < sentences.length; i++) {
            var words = getWords(sentences[i]);
            var tf = {};
            var seen = {};

            for (var j = 0; j < words.length; j++) {
                var w = words[j];
                if (STOPS[w] || w.length < 3) continue;
                tf[w] = (tf[w] || 0) + 1;
                if (!seen[w]) {
                    docFreq[w] = (docFreq[w] || 0) + 1;
                    seen[w] = true;
                }
            }

            var maxF = 1;
            for (var k in tf) { if (tf[k] > maxF) maxF = tf[k]; }
            for (var k in tf) { tf[k] = tf[k] / maxF; }
            termFreqs.push(tf);
        }

        var N = sentences.length;
        var tfidf = [];
        for (var i = 0; i < N; i++) {
            var scores = {};
            for (var w in termFreqs[i]) {
                var idf = Math.log((N + 1) / ((docFreq[w] || 0) + 1));
                scores[w] = termFreqs[i][w] * idf;
            }
            tfidf.push(scores);
        }

        setProg(50, 'Ranking sentences...', 'Scoring');
        await delay(200);

        // Score sentences
        var scored = [];
        for (var i = 0; i < N; i++) {
            var score = 0;
            for (var w in tfidf[i]) score += tfidf[i][w];

            var posFactor = 1;
            if (i < 3) posFactor = 1.5;
            if (i === 0) posFactor = 2;
            if (i >= N - 2) posFactor = 1.3;

            var wds = sentences[i].split(/\s+/).length;
            var lenFactor = 1;
            if (wds < 8) lenFactor = 0.7;
            if (wds > 40) lenFactor = 0.8;

            if (/\d+/.test(sentences[i])) score *= 1.2;

            scored.push({ idx: i, score: score * posFactor * lenFactor });
        }

        setProg(65, 'Selecting key points...', 'Extracting');
        await delay(200);

        // Target sentences
        var target;
        switch (S.len) {
            case 'brief': target = Math.max(2, Math.min(3, Math.ceil(N * 0.1))); break;
            case 'detailed': target = Math.max(5, Math.min(15, Math.ceil(N * 0.35))); break;
            case 'bullets': target = Math.max(5, Math.min(10, Math.ceil(N * 0.25))); break;
            default: target = Math.max(3, Math.min(7, Math.ceil(N * 0.2)));
        }

        scored.sort(function(a, b) { return b.score - a.score; });

        var selected = [];
        var usedW = {};

        for (var i = 0; i < scored.length && selected.length < target; i++) {
            var ws = getWords(sentences[scored[i].idx]);
            var newW = [];
            for (var j = 0; j < ws.length; j++) {
                if (!usedW[ws[j]] && !STOPS[ws[j]]) newW.push(ws[j]);
            }
            var overlap = 1 - (newW.length / Math.max(ws.length, 1));
            if (overlap > 0.6 && selected.length > 0) continue;

            selected.push(scored[i].idx);
            for (var j = 0; j < ws.length; j++) usedW[ws[j]] = true;
        }

        selected.sort(function(a, b) { return a - b; });

        setProg(80, 'Formatting...', 'Building output');
        await delay(200);

        var parts = [];
        for (var i = 0; i < selected.length; i++) {
            parts.push(sentences[selected[i]]);
        }
        S.keyParts = parts;

        var style = document.getElementById('optStyle').value;
        var output = formatOutput(parts, style);
        S.sumText = output.text;
        S.sumHtml = output.html;

        var origWC = countWords(text);
        var sumWC = countWords(S.sumText);
        var reduction = origWC > 0 ? Math.round((1 - sumWC / origWC) * 100) : 0;

        setProg(100, 'Done!', 'Summary ready');
        await delay(300);

        // Display results
        document.getElementById('rOrig').textContent = origWC.toLocaleString();
        document.getElementById('rSum').textContent = sumWC.toLocaleString();
        document.getElementById('rRed').textContent = reduction + '%';
        document.getElementById('rSent').textContent = parts.length;

        var fillP = 100 - reduction;
        setTimeout(function() {
            document.getElementById('rbFill').style.width = fillP + '%';
        }, 300);
        document.getElementById('rbPct').textContent = fillP + '% of original';

        document.getElementById('sumOut').innerHTML = S.sumHtml;

        goTo('s3');
        console.log('Summary complete!');

    } catch(e) {
        console.error('Summarize error:', e);
        goTo('s1');
        showE('Failed: ' + e.message);
    }
}

// ===== FORMAT OUTPUT =====
function formatOutput(parts, style) {
    var text = '';
    var html = '';

    if (style === 'bullets' || S.len === 'bullets') {
        html += '<h3 style="color:#9333ea;font-size:16px;margin-bottom:10px;">Key Points</h3>';
        text += 'KEY POINTS:\n\n';
        for (var i = 0; i < parts.length; i++) {
            html += '<div style="display:flex;gap:8px;padding:5px 0;align-items:flex-start;">';
            html += '<div style="width:6px;height:6px;border-radius:50%;background:#9333ea;margin-top:8px;flex-shrink:0;"></div>';
            html += '<span>' + escH(parts[i]) + '</span></div>';
            text += '• ' + parts[i] + '\n';
        }
    } else if (style === 'structured') {
        html += '<h3 style="color:#9333ea;font-size:16px;margin-bottom:8px;">Overview</h3>';
        html += '<p>' + escH(parts[0] || '') + '</p>';
        text += 'OVERVIEW:\n' + (parts[0] || '') + '\n\n';

        if (parts.length > 2) {
            html += '<h3 style="color:#9333ea;font-size:16px;margin:15px 0 8px;">Key Findings</h3>';
            text += 'KEY FINDINGS:\n';
            for (var i = 1; i < parts.length - 1; i++) {
                html += '<div style="background:rgba(168,85,247,0.06);border-left:3px solid #9333ea;padding:8px 12px;margin:8px 0;border-radius:0 8px 8px 0;font-size:13px;">';
                html += escH(parts[i]) + '</div>';
                text += '- ' + parts[i] + '\n';
            }
        }
        if (parts.length > 1) {
            html += '<h3 style="color:#9333ea;font-size:16px;margin:15px 0 8px;">Conclusion</h3>';
            html += '<p>' + escH(parts[parts.length - 1]) + '</p>';
            text += '\nCONCLUSION:\n' + parts[parts.length - 1];
        }
    } else if (style === 'academic') {
        var joined = [];
        for (var i = 0; i < parts.length; i++) joined.push(escH(parts[i]));
        html += '<h3 style="color:#9333ea;font-size:16px;margin-bottom:8px;">Abstract</h3>';
        html += '<p style="text-align:justify;">' + joined.join(' ') + '</p>';
        text += 'ABSTRACT:\n\n' + parts.join(' ');
    } else {
        var joined = [];
        for (var i = 0; i < parts.length; i++) joined.push(escH(parts[i]));
        html += '<h3 style="color:#9333ea;font-size:16px;margin-bottom:8px;">Summary</h3>';
        html += '<p>' + joined.join(' ') + '</p>';
        text += 'SUMMARY:\n\n' + parts.join(' ');
    }

    html += '<div style="margin-top:15px;padding-top:10px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;">';
    html += 'Generated by PDFTools AI - ' + parts.length + ' key sentences</div>';

    return { text: text.trim(), html: html };
}

// ===== COPY =====
function copySummary() {
    if (!S.sumText) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(S.sumText).then(function() {
            alert('Copied ' + countWords(S.sumText) + ' words!');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = S.sumText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Copied!');
    }
}

// ===== DOWNLOAD =====
function dlSum(fmt) {
    var blob, ext;
    if (fmt === 'txt') {
        blob = new Blob([S.sumText], { type: 'text/plain;charset=utf-8' });
        ext = '.txt';
    } else if (fmt === 'html') {
        var h = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Summary</title>';
        h += '<style>body{font-family:Calibri,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#333}h3{color:#9333ea}</style></head><body>';
        h += S.sumHtml + '</body></html>';
        blob = new Blob([h], { type: 'text/html;charset=utf-8' });
        ext = '.html';
    }
    if (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = S.name + '_summary' + ext;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    }
}

// ===== HELPERS =====
function getWords(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 0; });
}

function countWords(t) {
    return t.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
}

function goTo(id) {
    ['s1','s2','s3'].forEach(function(s) { document.getElementById(s).style.display = 'none'; });
    document.getElementById(id).style.display = 'block';
}

function setProg(p, t, s) {
    var b = document.getElementById('pb'), pt = document.getElementById('pp');
    var tt = document.getElementById('pt'), ss = document.getElementById('ps');
    if (b) b.style.width = p + '%';
    if (pt) pt.textContent = p + '%';
    if (tt) tt.textContent = t;
    if (ss) ss.textContent = s;
}

function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 10000);
}

function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

function fmtSz(b) {
    if (!b) return '0 B';
    var k = 1024, u = ['B','KB','MB','GB'];
    var i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + u[i];
}

function escH(s) {
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

function delay(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

console.log('AI Summarizer JS loaded');