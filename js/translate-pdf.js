// ==========================================
// TRANSLATE PDF - FIXED TRANSLATION API
// Proper error handling + working API calls
// ==========================================

// PDF.js init
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js OK');
} catch(e) { console.error(e); }

var T = {
    mode: 'pdf',
    rawBytes: null,
    name: 'document',
    fullText: '',
    pages: 0,
    origParas: [],
    transParas: [],
    translatedText: '',
    chunks: 0
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    var fi = document.getElementById('fi');
    var pickBtn = document.getElementById('pickBtn');
    var uploadArea = document.getElementById('uploadArea');

    if (pickBtn) {
        pickBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fi.click();
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            if (e.target === pickBtn || (pickBtn && pickBtn.contains(e.target))) return;
            fi.click();
        });
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#2563eb';
        });
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(59,130,246,0.25)';
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(59,130,246,0.25)';
            if (e.dataTransfer.files[0]) loadPDF(e.dataTransfer.files[0]);
        });
    }

    if (fi) {
        fi.addEventListener('change', function() {
            if (fi.files && fi.files[0]) loadPDF(fi.files[0]);
            fi.value = '';
        });
    }
});

// ===== INPUT SWITCH =====
function switchInput(mode) {
    T.mode = mode;
    var tp = document.getElementById('tabPdf');
    var tt = document.getElementById('tabText');
    var pm = document.getElementById('pdfMode');
    var tm = document.getElementById('textMode');
    if (tp) tp.className = 'input-tab' + (mode === 'pdf' ? ' on' : '');
    if (tt) tt.className = 'input-tab' + (mode === 'text' ? ' on' : '');
    if (pm) pm.style.display = mode === 'pdf' ? 'block' : 'none';
    if (tm) tm.style.display = mode === 'text' ? 'block' : 'none';
}

function swapLangs() {
    var s = document.getElementById('srcLang');
    var t = document.getElementById('tgtLang');
    if (!s || !t || s.value === 'auto') return;
    var tmp = s.value; s.value = t.value; t.value = tmp;
}

function quickLang(code) {
    var t = document.getElementById('tgtLang');
    if (t) t.value = code;
    document.querySelectorAll('.lang-chip').forEach(function(c) { c.classList.remove('on'); });
    if (event && event.target) {
        var chip = event.target.closest('.lang-chip');
        if (chip) chip.classList.add('on');
    }
}

// ===== LOAD PDF =====
async function loadPDF(file) {
    hideE();
    if (!file.name.toLowerCase().endsWith('.pdf')) { showE('Select a PDF!'); return; }
    T.name = file.name.replace(/\.pdf$/i, '');

    try {
        var ab = await readBuf(file);
        T.rawBytes = new Uint8Array(ab);

        var pdf = await pdfjsLib.getDocument({ data: T.rawBytes.slice(0) }).promise;
        T.pages = pdf.numPages;

        T.fullText = '';
        for (var i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var content = await page.getTextContent();
            var txt = '', lastY = null;
            for (var j = 0; j < content.items.length; j++) {
                var item = content.items[j];
                if (item.str === undefined) continue;
                var y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 3) txt += '\n';
                else if (txt.length > 0 && item.str.length > 0) txt += ' ';
                txt += item.str; lastY = y;
            }
            T.fullText += txt.trim() + '\n\n';
        }
        T.fullText = T.fullText.trim();

        var wc = T.fullText.split(/\s+/).filter(function(w) { return w.length > 0; }).length;

        setEl('fn', file.name);
        setEl('fs', fmtSz(file.size));
        setEl('fp', T.pages);
        setEl('fw', wc.toLocaleString());
        showEl('fInfo');

    } catch(e) {
        console.error(e);
        showE('Cannot read PDF: ' + e.message);
    }
}

function clearFile() {
    T.rawBytes = null; T.fullText = ''; T.pages = 0;
    hideEl('fInfo');
    var fi = document.getElementById('fi');
    if (fi) fi.value = '';
}

function readBuf(f) {
    return new Promise(function(ok, fail) {
        var r = new FileReader();
        r.onload = function() { ok(r.result); };
        r.onerror = function() { fail(new Error('Read failed')); };
        r.readAsArrayBuffer(f);
    });
}

// ==========================================
// ✅ TRANSLATE - FIXED API CALLS
// ==========================================
async function doTranslate() {
    hideE();

    // Get text
    var text = '';
    if (T.mode === 'pdf') {
        text = T.fullText;
    } else {
        var el = document.getElementById('txtInput');
        if (el) text = el.value.trim();
    }

    if (!text || text.length < 5) {
        showE('Please provide text to translate.' +
              (T.mode === 'pdf' ? ' Upload a PDF first.' : ''));
        return;
    }

    var srcLang = getVal('srcLang') || 'en';
    var tgtLang = getVal('tgtLang') || 'hi';

    if (srcLang !== 'auto' && srcLang === tgtLang) {
        showE('Source and target languages must be different!');
        return;
    }

    goTo('s2');
    console.log('Translating:', srcLang, '→', tgtLang, 'Text length:', text.length);

    try {
        setProg(5, 'Preparing...', 'Splitting text');
        await pause(200);

        // Split into paragraphs
        T.origParas = text.split(/\n+/).filter(function(p) { return p.trim().length > 0; });
        T.transParas = [];
        T.chunks = 0;

        // ✅ FIX: Split into SMALLER chunks (max 400 chars)
        // MyMemory API works best with shorter texts
        var chunks = [];
        for (var i = 0; i < T.origParas.length; i++) {
            var para = T.origParas[i].trim();
            if (para.length === 0) continue;

            if (para.length <= 400) {
                chunks.push({ paraIdx: i, text: para });
            } else {
                // Split by sentences
                var parts = para.split(/(?<=[.!?।])\s+/);
                var current = '';
                for (var s = 0; s < parts.length; s++) {
                    if ((current + ' ' + parts[s]).length > 400 && current.length > 0) {
                        chunks.push({ paraIdx: i, text: current.trim() });
                        current = parts[s];
                    } else {
                        current += (current ? ' ' : '') + parts[s];
                    }
                }
                if (current.trim()) chunks.push({ paraIdx: i, text: current.trim() });
            }
        }

        T.chunks = chunks.length;
        console.log('Total chunks:', T.chunks);

        if (T.chunks === 0) {
            goTo('s1');
            showE('No text to translate!');
            return;
        }

        // Initialize results
        var paraResults = {};
        for (var i = 0; i < T.origParas.length; i++) paraResults[i] = '';

        // ✅ FIX: Proper language pair format
        var fromLang = srcLang === 'auto' ? 'en' : srcLang;
        var langPair = fromLang + '|' + tgtLang;
        console.log('Language pair:', langPair);

        setProg(10, 'Translating...', '0/' + T.chunks + ' chunks');

        var successCount = 0;
        var failCount = 0;

        // Translate each chunk
        for (var i = 0; i < chunks.length; i++) {
            setProg(
                10 + Math.round((i / chunks.length) * 80),
                'Translating chunk ' + (i + 1) + '/' + chunks.length,
                'Please wait...'
            );

            console.log('Chunk ' + (i+1) + ':', chunks[i].text.substring(0, 50) + '...');

            var result = await callTranslateAPI(chunks[i].text, langPair);

            if (result.success) {
                successCount++;
                console.log('  → Translated OK:', result.text.substring(0, 50) + '...');
            } else {
                failCount++;
                console.warn('  → Failed, using original');
            }

            var sep = paraResults[chunks[i].paraIdx] ? ' ' : '';
            paraResults[chunks[i].paraIdx] += sep + result.text;

            // ✅ FIX: Proper rate limiting (MyMemory needs 1-2 sec between calls)
            if (i < chunks.length - 1) {
                await pause(1200); // 1.2 second delay
            }
        }

        console.log('Translation done. Success:', successCount, 'Failed:', failCount);

        // Build final text
        T.transParas = [];
        for (var i = 0; i < T.origParas.length; i++) {
            T.transParas.push(paraResults[i] || T.origParas[i]);
        }
        T.translatedText = T.transParas.join('\n\n');

        setProg(95, 'Building output...', 'Almost done');
        await pause(200);
        setProg(100, 'Done!', successCount + ' chunks translated');

        if (failCount > 0) {
            console.warn(failCount + ' chunks failed to translate');
        }

        showResults(srcLang, tgtLang, successCount, failCount);

    } catch(e) {
        console.error('Translate error:', e);
        goTo('s1');
        showE('Translation failed: ' + e.message);
    }
}

// ==========================================
// ✅ FIXED API CALL - Proper error handling
// ==========================================
async function callTranslateAPI(text, langPair) {
    try {
        // ✅ FIX: Proper URL encoding
        var encodedText = encodeURIComponent(text);
        var url = 'https://api.mymemory.translated.net/get'
            + '?q=' + encodedText
            + '&langpair=' + langPair
            + '&de=pdftools@example.com'; // Adding email improves API limits

        console.log('API URL:', url.substring(0, 100) + '...');

        var response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
            console.warn('API returned:', response.status);
            return { success: false, text: text };
        }

        var data = await response.json();
        console.log('API data:', JSON.stringify(data).substring(0, 200));

        // ✅ FIX: Properly check response
        if (data && data.responseData && data.responseData.translatedText) {
            var translated = data.responseData.translatedText;

            // Remove MyMemory warnings
            translated = translated.replace(/MYMEMORY WARNING:.*/gi, '').trim();

            // Check if translation is same as input (API returned untranslated)
            if (translated.toLowerCase() === text.toLowerCase()) {
                console.warn('API returned same text - might not support this language pair');
                // Still return it, user can check
            }

            // Check for empty result
            if (!translated || translated.length === 0) {
                return { success: false, text: text };
            }

            return { success: true, text: translated };
        }

        // Check for error message
        if (data && data.responseStatus && data.responseStatus !== 200) {
            console.warn('API error status:', data.responseStatus, data.responseDetails);
        }

        return { success: false, text: text };

    } catch(e) {
        console.error('API call error:', e.message);
        return { success: false, text: text };
    }
}

// ===== SHOW RESULTS =====
function showResults(srcLang, tgtLang, okCount, failCount) {
    var langNames = {
        en:'English', hi:'Hindi', gu:'Gujarati', es:'Spanish',
        fr:'French', de:'German', zh:'Chinese', ja:'Japanese',
        ar:'Arabic', pt:'Portuguese', ru:'Russian', ko:'Korean',
        it:'Italian', nl:'Dutch', tr:'Turkish', pl:'Polish',
        sv:'Swedish', th:'Thai', auto:'Auto Detect'
    };
    var srcName = langNames[srcLang] || srcLang;
    var tgtName = langNames[tgtLang] || tgtLang;

    var origWC = 0;
    if (T.mode === 'pdf' && T.fullText) {
        origWC = T.fullText.split(/\s+/).filter(function(w){return w.length>0;}).length;
    } else {
        var txtEl = document.getElementById('txtInput');
        if (txtEl) origWC = txtEl.value.split(/\s+/).filter(function(w){return w.length>0;}).length;
    }
    var transWC = T.translatedText.split(/\s+/).filter(function(w){return w.length>0;}).length;

    setEl('rOrig', origWC.toLocaleString());
    setEl('rTrans', transWC.toLocaleString());
    setEl('rLang', srcName.substring(0,3) + ' → ' + tgtName.substring(0,3));
    setEl('rChunks', T.chunks);

    // Side by side view
    var viewHtml = '<div class="trans-side">';
    viewHtml += '<div class="trans-header src"><i class="fas fa-file-alt"></i> ' + escH(srcName) + '</div>';
    for (var i = 0; i < T.origParas.length; i++) {
        viewHtml += '<div class="trans-para">' + escH(T.origParas[i]) + '</div>';
    }
    viewHtml += '</div><div class="trans-side">';
    viewHtml += '<div class="trans-header tgt"><i class="fas fa-language"></i> ' + escH(tgtName) + '</div>';
    for (var i = 0; i < T.transParas.length; i++) {
        viewHtml += '<div class="trans-para">' + escH(T.transParas[i]) + '</div>';
    }
    viewHtml += '</div>';

    var tv = document.getElementById('transView');
    if (tv) tv.innerHTML = viewHtml;

    // Sync scroll
    setTimeout(function() {
        var sides = document.querySelectorAll('.trans-side');
        if (sides.length === 2) {
            sides[0].addEventListener('scroll', function() { sides[1].scrollTop = sides[0].scrollTop; });
            sides[1].addEventListener('scroll', function() { sides[0].scrollTop = sides[1].scrollTop; });
        }
    }, 200);

    var tt = document.getElementById('transText');
    if (tt) tt.textContent = T.translatedText;

    // Show warning if some chunks failed
    if (failCount > 0) {
        var warnHtml = '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:12px;margin:10px 0;font-size:12px;color:#92400e;">';
        warnHtml += '<i class="fas fa-exclamation-triangle" style="color:#f59e0b;margin-right:6px;"></i>';
        warnHtml += '<strong>' + failCount + ' chunk(s) could not be translated.</strong> ';
        warnHtml += 'Original text is shown for those parts. Try translating again or use a different language pair.';
        warnHtml += '</div>';
        if (tv) tv.insertAdjacentHTML('afterend', warnHtml);
    }

    goTo('s3');
}

// ===== COPY =====
function copyTrans() {
    if (!T.translatedText) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(T.translatedText).then(function() {
            alert('Translated text copied!');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = T.translatedText;
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Copied!');
    }
}

// ===== DOWNLOAD =====
function dlTrans(fmt) {
    var blob, ext;

    if (fmt === 'txt') {
        var c = '=== ORIGINAL ===\n\n' + T.origParas.join('\n\n');
        c += '\n\n=== TRANSLATED ===\n\n' + T.translatedText;
        blob = new Blob([c], { type: 'text/plain;charset=utf-8' });
        ext = '.txt';
    } else if (fmt === 'html') {
        var parts = [];
        parts.push('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Translation</title>');
        parts.push('<style>body{font-family:Calibri,sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#333}');
        parts.push('.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}');
        parts.push('.side{padding:15px;border-radius:10px}h2{margin-top:0}');
        parts.push('.orig{background:#eff6ff;border:1px solid #bfdbfe}');
        parts.push('.trans{background:#f0fdf4;border:1px solid #bbf7d0}');
        parts.push('p{line-height:1.8}</style></head><body>');
        parts.push('<h1 style="text-align:center;">Translation</h1>');
        parts.push('<div class="grid"><div class="side orig"><h2>Original</h2>');
        for (var i = 0; i < T.origParas.length; i++) parts.push('<p>' + escH(T.origParas[i]) + '</p>');
        parts.push('</div><div class="side trans"><h2>Translated</h2>');
        for (var i = 0; i < T.transParas.length; i++) parts.push('<p>' + escH(T.transParas[i]) + '</p>');
        parts.push('</div></div></body></html>');
        blob = new Blob([parts.join('\n')], { type: 'text/html;charset=utf-8' });
        ext = '.html';
    } else if (fmt === 'docx') {
        buildDocxDownload();
        return;
    }

    if (blob) dlBlob(blob, T.name + '_translated' + ext);
}

// DOCX builder (safe - no inline XML)
function buildDocxDownload() {
    var bodyParts = [];
    bodyParts.push(X('w:p', X('w:r', X('w:rPr', X('w:b','') + X('w:sz','','w:val="32"')) + X('w:t','Translated Document'))));
    bodyParts.push(X('w:p', ''));

    for (var i = 0; i < T.transParas.length; i++) {
        var ln = escXml(T.transParas[i]);
        bodyParts.push(X('w:p', X('w:r',
            X('w:rPr', X('w:rFonts','','w:ascii="Calibri" w:hAnsi="Calibri"') + X('w:sz','','w:val="24"')) +
            X('w:t', ln, 'xml:space="preserve"')
        )));
    }

    var sect = X('w:sectPr',
        X('w:pgSz','','w:w="12240" w:h="15840"') +
        X('w:pgMar','','w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"')
    );

    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        X('w:document', X('w:body', bodyParts.join('') + sect),
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"');

    var ct = '<?xml version="1.0" encoding="UTF-8"?>' +
        X('Types',
            X('Default','','Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"') +
            X('Default','','Extension="xml" ContentType="application/xml"') +
            X('Override','','PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"'),
            'xmlns="http://schemas.openxmlformats.org/package/2006/content-types"');

    var rr = '<?xml version="1.0" encoding="UTF-8"?>' +
        X('Relationships',
            X('Relationship','','Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"'),
            'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"');

    var wr = '<?xml version="1.0" encoding="UTF-8"?>' +
        X('Relationships','','xmlns="http://schemas.openxmlformats.org/package/2006/relationships"');

    var z = buildZip([
        {n:'[Content_Types].xml',d:ct},
        {n:'_rels/.rels',d:rr},
        {n:'word/_rels/document.xml.rels',d:wr},
        {n:'word/document.xml',d:doc}
    ]);

    dlBlob(new Blob([z], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),
        T.name + '_translated.docx');
}

// XML tag builder
function X(name, content, attrs) {
    var s = '<' + name;
    if (attrs) s += ' ' + attrs;
    if (content === '' || content === undefined || content === null) return s + '/>';
    return s + '>' + content + '</' + name + '>';
}

function escXml(s) {
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
}

// ZIP builder
function buildZip(files) {
    var lc=[], cd=[], off=0;
    for (var i=0; i<files.length; i++) {
        var nb=new TextEncoder().encode(files[i].n);
        var db=new TextEncoder().encode(files[i].d);
        var cr=crc32(db);
        var lh=new Uint8Array(30+nb.length+db.length);
        var lv=new DataView(lh.buffer);
        lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);
        lv.setUint32(14,cr,true);lv.setUint32(18,db.length,true);
        lv.setUint32(22,db.length,true);lv.setUint16(26,nb.length,true);
        lh.set(nb,30);lh.set(db,30+nb.length);lc.push(lh);
        var ce=new Uint8Array(46+nb.length);var cv=new DataView(ce.buffer);
        cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);
        cv.setUint32(16,cr,true);cv.setUint32(20,db.length,true);cv.setUint32(24,db.length,true);
        cv.setUint16(28,nb.length,true);cv.setUint32(42,off,true);
        ce.set(nb,46);cd.push(ce);off+=lh.length;
    }
    var cs=0;for(var i=0;i<cd.length;i++)cs+=cd[i].length;
    var en=new Uint8Array(22);var ev=new DataView(en.buffer);
    ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);
    ev.setUint16(10,files.length,true);ev.setUint32(12,cs,true);ev.setUint32(16,off,true);
    var out=new Uint8Array(off+cs+22);var p=0;
    for(var i=0;i<lc.length;i++){out.set(lc[i],p);p+=lc[i].length;}
    for(var i=0;i<cd.length;i++){out.set(cd[i],p);p+=cd[i].length;}
    out.set(en,p);return out;
}
function crc32(d){var t=[];for(var i=0;i<256;i++){var c=i;for(var j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[i]=c;}var v=0xFFFFFFFF;for(var i=0;i<d.length;i++)v=t[(v^d[i])&0xFF]^(v>>>8);return(v^0xFFFFFFFF)>>>0;}

// Download blob helper
function dlBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// ===== HELPERS =====
function goTo(id) {
    ['s1','s2','s3'].forEach(function(s) {
        document.getElementById(s).style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
}

function setProg(p, t, s) {
    var b=document.getElementById('pb'), pt=document.getElementById('pp');
    var tt=document.getElementById('pt'), ss=document.getElementById('ps');
    if(b) b.style.width = p + '%';
    if(pt) pt.textContent = p + '%';
    if(tt) tt.textContent = t;
    if(ss) ss.textContent = s;
}

function showE(m) {
    var el=document.getElementById('em'), t=document.getElementById('et');
    if(el&&t){t.textContent=m;el.style.display='block';}
    setTimeout(hideE, 12000);
}
function hideE() {
    var el=document.getElementById('em');
    if(el) el.style.display='none';
}

function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}
function showEl(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'block';
}
function hideEl(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
}

function fmtSz(b) {
    if(!b) return '0 B';
    var k=1024, u=['B','KB','MB','GB'];
    var i=Math.floor(Math.log(b)/Math.log(k));
    return (b/Math.pow(k,i)).toFixed(1)+' '+u[i];
}

function escH(s) {
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
}

function pause(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

console.log('Translate PDF JS loaded (fixed API)');