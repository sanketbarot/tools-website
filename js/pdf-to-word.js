// ==========================================
// PDF TO WORD - FIXED ArrayBuffer Issue
// ==========================================

// PDF.js init
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js OK');
} catch(e) { console.error('PDF.js error:', e); }

// State
var D = {
    bytes: null,    // ✅ Stored as Uint8Array (never detaches)
    name: 'document',
    pg: 0,
    sz: 0,
    txt: '',
    ptx: [],
    fmt: 'docx',
    blob: null
};

// ===== DOM ELEMENTS =====
var fileInput = document.getElementById('fileInput');
var pickBtn = document.getElementById('pickBtn');
var dropArea = document.getElementById('dropArea');

// ===== EVENT LISTENERS =====
if (pickBtn) {
    pickBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
}

if (fileInput) {
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            onFile(fileInput.files[0]);
        }
        fileInput.value = '';
    });
}

if (dropArea) {
    dropArea.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            fileInput.click();
        }
    });

    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });

    dropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
            onFile(e.dataTransfer.files[0]);
        }
    });
}

// ===== ON FILE SELECT =====
async function onFile(file) {
    hideError();
    console.log('File:', file.name, file.size);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showError('Please select a PDF file!');
        return;
    }

    D.name = file.name.replace(/\.pdf$/i, '');
    D.sz = file.size;

    try {
        // ✅ FIX: Read file and store as Uint8Array immediately
        var arrayBuffer = await readBuffer(file);
        D.bytes = new Uint8Array(arrayBuffer);
        console.log('Stored bytes:', D.bytes.length);

        // ✅ FIX: Use .slice(0) to create fresh copy for PDF.js
        var freshCopy = D.bytes.slice(0);
        var pdf = await pdfjsLib.getDocument({ data: freshCopy }).promise;
        D.pg = pdf.numPages;
        console.log('Pages:', D.pg);

        document.getElementById('fName').textContent = file.name;
        document.getElementById('fSize').textContent = formatBytes(file.size);
        document.getElementById('fPages').textContent = D.pg;

        goStep('s2');
    } catch(e) {
        console.error('Load error:', e);
        showError('Cannot read PDF: ' + e.message);
    }
}

// Read file as ArrayBuffer
function readBuffer(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function() { reject(new Error('File read failed')); };
        reader.readAsArrayBuffer(file);
    });
}

// ===== FORMAT PICKER =====
function pickFormat(el) {
    D.fmt = el.getAttribute('data-f');
    document.querySelectorAll('.fmt-card').forEach(function(c) {
        c.classList.remove('on');
    });
    el.classList.add('on');
}

// ===== CONVERT =====
async function startConvert() {
    hideError();
    goStep('s3');
    console.log('Converting, format:', D.fmt);

    try {
        setProgress(5, 'Loading PDF...', 'Opening document');

        // ✅ FIX: Always create FRESH copy with .slice(0)
        var freshBytes = D.bytes.slice(0);
        console.log('Fresh bytes for conversion:', freshBytes.length);

        var pdf = await pdfjsLib.getDocument({ data: freshBytes }).promise;
        console.log('PDF loaded for conversion, pages:', pdf.numPages);

        D.ptx = [];
        D.txt = '';

        // Extract text from each page
        for (var i = 1; i <= pdf.numPages; i++) {
            setProgress(
                Math.round((i / pdf.numPages) * 70) + 5,
                'Page ' + i + ' / ' + pdf.numPages,
                'Extracting text...'
            );

            var page = await pdf.getPage(i);
            var content = await page.getTextContent();

            var pageText = '';
            var lastY = null;

            for (var j = 0; j < content.items.length; j++) {
                var item = content.items[j];
                if (item.str === undefined) continue;

                var y = Math.round(item.transform[5]);

                if (lastY !== null && Math.abs(y - lastY) > 3) {
                    pageText += '\n';
                } else if (pageText.length > 0 && item.str.length > 0) {
                    pageText += ' ';
                }

                pageText += item.str;
                lastY = y;
            }

            D.ptx.push(pageText.trim());
            D.txt += pageText.trim() + '\n\n';
        }

        D.txt = D.txt.trim();
        console.log('Text extracted, length:', D.txt.length);

        if (D.txt.length < 5) {
            goStep('s2');
            showError('No text found. This PDF may be scanned. Try our OCR tool.');
            return;
        }

        // Build output file
        setProgress(80, 'Creating file...', 'Building ' + D.fmt.toUpperCase());

        if (D.fmt === 'txt') {
            buildTXT();
        } else if (D.fmt === 'html') {
            buildHTML();
        } else {
            buildDOCX();
        }

        console.log('File built, blob size:', D.blob.size);
        setProgress(100, 'Done!', 'Ready');

        setTimeout(showResults, 400);

    } catch(e) {
        console.error('Convert error:', e);
        goStep('s2');
        showError('Conversion failed: ' + e.message);
    }
}

// ===== BUILD TXT =====
function buildTXT() {
    var text = '';
    for (var i = 0; i < D.ptx.length; i++) {
        text += '=== Page ' + (i + 1) + ' ===\n\n';
        text += D.ptx[i] + '\n\n';
    }
    D.blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
}

// ===== BUILD HTML =====
function buildHTML() {
    var parts = [];
    parts.push('<!DOCTYPE html>');
    parts.push('<html><head><meta charset="UTF-8">');
    parts.push('<title>' + escXml(D.name) + '</title>');
    parts.push('<style>');
    parts.push('body{font-family:Calibri,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#333}');
    parts.push('.pg{margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #eee}');
    parts.push('.ph{color:#6366f1;font-size:12px;font-weight:700;margin-bottom:10px}');
    parts.push('p{margin:0 0 8px}');
    parts.push('</style></head><body>');

    for (var i = 0; i < D.ptx.length; i++) {
        parts.push('<div class="pg">');
        parts.push('<div class="ph">Page ' + (i + 1) + '</div>');
        var lines = D.ptx[i].split('\n');
        for (var j = 0; j < lines.length; j++) {
            var ln = lines[j].trim();
            if (ln) parts.push('<p>' + escXml(ln) + '</p>');
        }
        parts.push('</div>');
    }

    parts.push('</body></html>');
    D.blob = new Blob([parts.join('\n')], { type: 'text/html;charset=utf-8' });
}

// ===== BUILD DOCX =====
function buildDOCX() {
    var bodyParts = [];

    for (var p = 0; p < D.ptx.length; p++) {
        var lines = D.ptx[p].split('\n');

        for (var l = 0; l < lines.length; l++) {
            var ln = lines[l].trim();

            if (!ln) {
                bodyParts.push(T('w:p', ''));
                continue;
            }

            ln = escXml(ln);
            var boldTag = (l < 2 && ln.length < 80) ? T('w:b', '') : '';

            var runProps = T('w:rPr',
                T('w:rFonts', '', 'w:ascii="Calibri" w:hAnsi="Calibri"') +
                T('w:sz', '', 'w:val="24"') +
                boldTag
            );

            var textNode = T('w:t', ln, 'xml:space="preserve"');
            var run = T('w:r', runProps + textNode);
            var paraProps = T('w:pPr',
                T('w:spacing', '', 'w:after="120" w:line="360" w:lineRule="auto"')
            );

            bodyParts.push(T('w:p', paraProps + run));
        }

        if (p < D.ptx.length - 1) {
            bodyParts.push(T('w:p', T('w:r', T('w:br', '', 'w:type="page"'))));
        }
    }

    var sectPr = T('w:sectPr',
        T('w:pgSz', '', 'w:w="12240" w:h="15840"') +
        T('w:pgMar', '', 'w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"')
    );

    var docBody = bodyParts.join('') + sectPr;

    var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        T('w:document',
            T('w:body', docBody),
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
        );

    var contentTypes = '<?xml version="1.0" encoding="UTF-8"?>' +
        T('Types',
            T('Default', '', 'Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"') +
            T('Default', '', 'Extension="xml" ContentType="application/xml"') +
            T('Override', '', 'PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"'),
            'xmlns="http://schemas.openxmlformats.org/package/2006/content-types"'
        );

    var rootRels = '<?xml version="1.0" encoding="UTF-8"?>' +
        T('Relationships',
            T('Relationship', '', 'Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"'),
            'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"'
        );

    var wordRels = '<?xml version="1.0" encoding="UTF-8"?>' +
        T('Relationships', '',
            'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"'
        );

    var zipData = createZip([
        { name: '[Content_Types].xml', data: contentTypes },
        { name: '_rels/.rels', data: rootRels },
        { name: 'word/_rels/document.xml.rels', data: wordRels },
        { name: 'word/document.xml', data: documentXml }
    ]);

    D.blob = new Blob([zipData], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
}

// ===== XML TAG BUILDER =====
function T(name, content, attrs) {
    var s = '<' + name;
    if (attrs) s += ' ' + attrs;
    if (content === '' || content === undefined || content === null) {
        return s + '/>';
    }
    return s + '>' + content + '</' + name + '>';
}

// ===== ZIP BUILDER =====
function createZip(files) {
    var locals = [];
    var centrals = [];
    var offset = 0;

    for (var i = 0; i < files.length; i++) {
        var nameBytes = new TextEncoder().encode(files[i].name);
        var dataBytes = new TextEncoder().encode(files[i].data);
        var crcVal = calcCRC(dataBytes);

        var lh = new Uint8Array(30 + nameBytes.length + dataBytes.length);
        var lv = new DataView(lh.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint32(14, crcVal, true);
        lv.setUint32(18, dataBytes.length, true);
        lv.setUint32(22, dataBytes.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lh.set(nameBytes, 30);
        lh.set(dataBytes, 30 + nameBytes.length);
        locals.push(lh);

        var cd = new Uint8Array(46 + nameBytes.length);
        var cv = new DataView(cd.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint32(16, crcVal, true);
        cv.setUint32(20, dataBytes.length, true);
        cv.setUint32(24, dataBytes.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(42, offset, true);
        cd.set(nameBytes, 46);
        centrals.push(cd);

        offset += lh.length;
    }

    var cdSize = 0;
    for (var i = 0; i < centrals.length; i++) cdSize += centrals[i].length;

    var endRec = new Uint8Array(22);
    var ev = new DataView(endRec.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);

    var totalSize = offset + cdSize + 22;
    var result = new Uint8Array(totalSize);
    var pos = 0;

    for (var i = 0; i < locals.length; i++) {
        result.set(locals[i], pos);
        pos += locals[i].length;
    }
    for (var i = 0; i < centrals.length; i++) {
        result.set(centrals[i], pos);
        pos += centrals[i].length;
    }
    result.set(endRec, pos);

    return result;
}

// CRC32
function calcCRC(data) {
    var table = [];
    for (var i = 0; i < 256; i++) {
        var c = i;
        for (var j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < data.length; i++) {
        crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ===== SHOW RESULTS =====
function showResults() {
    var words = D.txt.split(/\s+/).filter(function(w) { return w.length > 0; }).length;

    document.getElementById('rPg').textContent = D.pg;
    document.getElementById('rWd').textContent = words.toLocaleString();
    document.getElementById('rCh').textContent = D.txt.length.toLocaleString();

    var preview = D.txt.substring(0, 1500);
    if (D.txt.length > 1500) {
        preview += '\n\n... [' + (D.txt.length - 1500) + ' more chars]';
    }
    document.getElementById('prevBox').textContent = preview;

    var ext = D.fmt === 'docx' ? '.docx' : D.fmt === 'txt' ? '.txt' : '.html';
    document.getElementById('outName').textContent = D.name + ext;
    document.getElementById('outSize').textContent = D.blob ? formatBytes(D.blob.size) : '-';

    goStep('s4');
}

// ===== DOWNLOAD =====
function dlFile() {
    if (!D.blob) { alert('No file ready.'); return; }
    var ext = D.fmt === 'docx' ? '.docx' : D.fmt === 'txt' ? '.txt' : '.html';
    var url = URL.createObjectURL(D.blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = D.name + ext;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 500);
}

// ===== COPY TEXT =====
function copyTxt() {
    if (!D.txt) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(D.txt).then(function() {
            alert('Copied ' + D.txt.length + ' characters!');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = D.txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Copied!');
    }
}

// ===== RESET =====
function resetAll() {
    D.bytes = null;
    D.name = 'document';
    D.pg = 0;
    D.txt = '';
    D.ptx = [];
    D.blob = null;
    D.fmt = 'docx';
    hideError();
    setProgress(0, '', '');
    if (fileInput) fileInput.value = '';
    document.querySelectorAll('.fmt-card').forEach(function(c) { c.classList.remove('on'); });
    var docxCard = document.querySelector('.fmt-docx');
    if (docxCard) docxCard.classList.add('on');
    goStep('s1');
}

function goBack() {
    D.blob = null;
    goStep('s2');
}

// ===== HELPERS =====
function goStep(id) {
    ['s1', 's2', 's3', 's4'].forEach(function(s) {
        document.getElementById(s).style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
}

function setProgress(pct, title, sub) {
    var bar = document.getElementById('pBar');
    var txt = document.getElementById('pPct');
    var ttl = document.getElementById('pTitle');
    var sb = document.getElementById('pSub');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '%';
    if (ttl) ttl.textContent = title;
    if (sb) sb.textContent = sub;
}

function showError(msg) {
    var el = document.getElementById('errBox');
    var txt = document.getElementById('errTxt');
    if (el && txt) {
        txt.textContent = msg;
        el.style.display = 'block';
    }
    setTimeout(hideError, 10000);
}

function hideError() {
    var el = document.getElementById('errBox');
    if (el) el.style.display = 'none';
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    var k = 1024;
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + units[i];
}

function escXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

console.log('PDF to Word JS loaded - ArrayBuffer fix applied');