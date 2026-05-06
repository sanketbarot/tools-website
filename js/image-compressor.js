// ==========================================
// IMAGE COMPRESSOR - COMPLETE WORKING
// Uses Canvas API for compression
// ==========================================

var IC = {
    files: [],
    compressed: [],
    totalOrigSize: 0,
    totalCompSize: 0
};

document.addEventListener('DOMContentLoaded', function() {
    var fi = document.getElementById('fi');
    var pickBtn = document.getElementById('pickBtn');
    var dropArea = document.getElementById('dropArea');

    if (pickBtn) {
        pickBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fi.click();
        });
    }

    if (fi) {
        fi.addEventListener('change', function() {
            if (fi.files.length > 0) addFiles(Array.from(fi.files));
            fi.value = '';
        });
    }

    if (dropArea) {
        dropArea.addEventListener('click', function(e) {
            if (e.target === pickBtn || (pickBtn && pickBtn.contains(e.target))) return;
            fi.click();
        });
        dropArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropArea.style.borderColor = '#f43f5e';
            dropArea.style.background = 'rgba(244,63,94,0.05)';
        });
        dropArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropArea.style.borderColor = 'rgba(244,63,94,0.25)';
            dropArea.style.background = '';
        });
        dropArea.addEventListener('drop', function(e) {
            e.preventDefault();
            dropArea.style.borderColor = 'rgba(244,63,94,0.25)';
            dropArea.style.background = '';
            if (e.dataTransfer.files.length > 0) {
                addFiles(Array.from(e.dataTransfer.files));
            }
        });
    }

    // Quality slider
    var slider = document.getElementById('qualitySlider');
    if (slider) {
        slider.addEventListener('input', function() {
            document.getElementById('qualityVal').textContent = this.value + '%';
        });
    }
});

// Add files
function addFiles(files) {
    for (var i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) continue;
        IC.files.push({
            file: files[i],
            name: files[i].name,
            size: files[i].size,
            type: files[i].type
        });
    }

    if (IC.files.length > 0) {
        renderFileList();
        goTo('s2');
    }
}

// Render file list
function renderFileList() {
    var list = document.getElementById('fileList');
    list.innerHTML = '';

    IC.totalOrigSize = 0;

    for (var i = 0; i < IC.files.length; i++) {
        var f = IC.files[i];
        IC.totalOrigSize += f.size;

        var div = document.createElement('div');
        div.className = 'fl-item';
        div.innerHTML =
            '<div class="fl-icon"><i class="fas fa-image"></i></div>' +
            '<div class="fl-info">' +
                '<h4>' + escH(f.name) + '</h4>' +
                '<span>' + fmtSz(f.size) + ' • ' + f.type.split('/')[1].toUpperCase() + '</span>' +
            '</div>' +
            '<button class="fl-remove" onclick="removeFile(' + i + ')"><i class="fas fa-times"></i></button>';
        list.appendChild(div);
    }

    document.getElementById('fileCount').textContent = IC.files.length;
    document.getElementById('totalSize').textContent = fmtSz(IC.totalOrigSize);
}

// Remove file
function removeFile(idx) {
    IC.files.splice(idx, 1);
    if (IC.files.length === 0) {
        goTo('s1');
    } else {
        renderFileList();
    }
}

// Clear all
function clearAll() {
    IC.files = [];
    IC.compressed = [];
    IC.totalOrigSize = 0;
    IC.totalCompSize = 0;
    goTo('s1');
}

// ===== COMPRESS =====
async function compressImages() {
    hideE();

    if (IC.files.length === 0) {
        showE('Add at least one image!');
        return;
    }

    var quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    var maxWidth = parseInt(document.getElementById('maxWidth').value) || 0;
    var outputFormat = document.getElementById('outputFormat').value;

    goTo('s3');
    IC.compressed = [];
    IC.totalCompSize = 0;

    for (var i = 0; i < IC.files.length; i++) {
        setProg(
            Math.round((i / IC.files.length) * 90),
            'Compressing ' + (i + 1) + '/' + IC.files.length,
            IC.files[i].name
        );

        try {
            var result = await compressSingle(IC.files[i], quality, maxWidth, outputFormat);
            IC.compressed.push(result);
            IC.totalCompSize += result.compSize;
        } catch(e) {
            console.error('Compress error:', e);
            IC.compressed.push({
                name: IC.files[i].name,
                origSize: IC.files[i].size,
                compSize: IC.files[i].size,
                blob: IC.files[i].file,
                saved: 0,
                error: true
            });
        }

        await pause(50);
    }

    setProg(100, 'Done!', 'All images compressed');
    await pause(300);

    showResults();
}

// Compress single image
function compressSingle(fileObj, quality, maxWidth, format) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                var w = img.naturalWidth;
                var h = img.naturalHeight;

                // Resize if maxWidth set
                if (maxWidth > 0 && w > maxWidth) {
                    var ratio = maxWidth / w;
                    w = maxWidth;
                    h = Math.round(h * ratio);
                }

                canvas.width = w;
                canvas.height = h;

                // White background for JPG
                if (format === 'jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                }

                ctx.drawImage(img, 0, 0, w, h);

                // Determine output type
                var mimeType = 'image/' + format;
                var ext = format === 'jpeg' ? 'jpg' : format;

                canvas.toBlob(function(blob) {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }

                    var saved = Math.round(((fileObj.size - blob.size) / fileObj.size) * 100);
                    var outName = fileObj.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext;

                    // Create preview
                    var previewUrl = URL.createObjectURL(blob);

                    resolve({
                        name: outName,
                        origName: fileObj.name,
                        origSize: fileObj.size,
                        compSize: blob.size,
                        blob: blob,
                        saved: Math.max(saved, 0),
                        previewUrl: previewUrl,
                        width: w,
                        height: h,
                        format: ext.toUpperCase(),
                        error: false
                    });
                }, mimeType, quality);
            };
            img.onerror = function() { reject(new Error('Invalid image')); };
            img.src = e.target.result;
        };
        reader.onerror = function() { reject(new Error('Read failed')); };
        reader.readAsDataURL(fileObj.file);
    });
}

// Show results
function showResults() {
    var totalSaved = IC.totalOrigSize - IC.totalCompSize;
    var savedPct = IC.totalOrigSize > 0 ? Math.round((totalSaved / IC.totalOrigSize) * 100) : 0;

    document.getElementById('rCount').textContent = IC.compressed.length;
    document.getElementById('rOrigSize').textContent = fmtSz(IC.totalOrigSize);
    document.getElementById('rCompSize').textContent = fmtSz(IC.totalCompSize);
    document.getElementById('rSaved').textContent = savedPct + '%';

    // Savings bar
    document.getElementById('savingsBar').style.width = savedPct + '%';
    document.getElementById('savingsText').textContent = savedPct + '% smaller';

    // File results
    var grid = document.getElementById('resultGrid');
    grid.innerHTML = '';

    for (var i = 0; i < IC.compressed.length; i++) {
        var r = IC.compressed[i];
        var savedColor = r.saved > 0 ? '#22c55e' : '#f59e0b';

        var card = document.createElement('div');
        card.className = 'res-card';
        card.innerHTML =
            '<div class="res-preview">' +
                (r.previewUrl ? '<img src="' + r.previewUrl + '" alt="' + escH(r.name) + '">' : '<i class="fas fa-image"></i>') +
            '</div>' +
            '<div class="res-info">' +
                '<h4>' + escH(r.name) + '</h4>' +
                '<div class="res-sizes">' +
                    '<span class="rs-orig">' + fmtSz(r.origSize) + '</span>' +
                    '<i class="fas fa-arrow-right"></i>' +
                    '<span class="rs-comp">' + fmtSz(r.compSize) + '</span>' +
                '</div>' +
                '<div class="res-saved" style="color:' + savedColor + ';">' +
                    '<i class="fas fa-' + (r.saved > 0 ? 'check-circle' : 'minus-circle') + '"></i> ' +
                    (r.saved > 0 ? r.saved + '% smaller' : 'No reduction') +
                '</div>' +
                '<div class="res-dims">' + r.width + '×' + r.height + ' • ' + r.format + '</div>' +
            '</div>' +
            '<button class="res-dl" onclick="downloadSingle(' + i + ')"><i class="fas fa-download"></i></button>';

        grid.appendChild(card);
    }

    goTo('s4');
}

// Download single
function downloadSingle(idx) {
    var r = IC.compressed[idx];
    if (!r || !r.blob) return;
    dlBlob(r.blob, r.name);
}

// Download all as ZIP
async function downloadAll() {
    if (IC.compressed.length === 1) {
        downloadSingle(0);
        return;
    }

    // Simple download each file
    for (var i = 0; i < IC.compressed.length; i++) {
        downloadSingle(i);
        await pause(300);
    }
}

// Download blob helper
function dlBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// ===== HELPERS =====
function goTo(id) {
    ['s1','s2','s3','s4'].forEach(function(s) {
        document.getElementById(s).style.display = 'none';
    });
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
    setTimeout(hideE, 6000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

function fmtSz(b) {
    if (!b) return '0 B';
    var k = 1024, u = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + u[i];
}

function escH(s) {
    return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

function pause(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

console.log('Image Compressor loaded');