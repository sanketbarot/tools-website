// ==========================================
// PASSWORD GENERATOR - COMPLETE WORKING
// ==========================================

var PG = {
    history: [],
    currentPassword: ''
};

document.addEventListener('DOMContentLoaded', function() {
    generatePassword();

    // Length slider
    var slider = document.getElementById('lengthSlider');
    if (slider) {
        slider.addEventListener('input', function() {
            document.getElementById('lengthVal').textContent = this.value;
            document.getElementById('lengthInput').value = this.value;
            generatePassword();
        });
    }

    var lenInput = document.getElementById('lengthInput');
    if (lenInput) {
        lenInput.addEventListener('input', function() {
            var val = clamp(parseInt(this.value) || 8, 4, 128);
            document.getElementById('lengthSlider').value = val;
            document.getElementById('lengthVal').textContent = val;
            generatePassword();
        });
    }

    // Auto-generate on option change
    var checkboxes = document.querySelectorAll('.opt-check input');
    checkboxes.forEach(function(cb) {
        cb.addEventListener('change', function() { generatePassword(); });
    });
});

// ===== GENERATE PASSWORD =====
function generatePassword() {
    var length = parseInt(document.getElementById('lengthSlider').value) || 16;
    var useUpper = document.getElementById('optUpper').checked;
    var useLower = document.getElementById('optLower').checked;
    var useNumbers = document.getElementById('optNumbers').checked;
    var useSymbols = document.getElementById('optSymbols').checked;
    var excludeAmbiguous = document.getElementById('optExclude').checked;
    var noRepeat = document.getElementById('optNoRepeat').checked;

    // Build character pool
    var upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var lower = 'abcdefghijklmnopqrstuvwxyz';
    var numbers = '0123456789';
    var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

    if (excludeAmbiguous) {
        upper = upper.replace(/[OILSZ]/g, '');
        lower = lower.replace(/[oil]/g, '');
        numbers = numbers.replace(/[01]/g, '');
        symbols = symbols.replace(/[|`~]/g, '');
    }

    var pool = '';
    var required = [];

    if (useUpper) { pool += upper; required.push(upper); }
    if (useLower) { pool += lower; required.push(lower); }
    if (useNumbers) { pool += numbers; required.push(numbers); }
    if (useSymbols) { pool += symbols; required.push(symbols); }

    if (pool.length === 0) {
        pool = lower;
        required.push(lower);
        document.getElementById('optLower').checked = true;
    }

    // Generate
    var password = '';
    var attempts = 0;

    do {
        password = '';

        // Ensure at least one from each required set
        for (var i = 0; i < required.length; i++) {
            password += required[i].charAt(Math.floor(Math.random() * required[i].length));
        }

        // Fill remaining length
        while (password.length < length) {
            var char = pool.charAt(Math.floor(Math.random() * pool.length));
            if (noRepeat && password.indexOf(char) !== -1 && pool.length > password.length) {
                continue;
            }
            password += char;
        }

        // Shuffle
        password = shuffleString(password);
        attempts++;
    } while (attempts < 5 && password.length < length);

    // Trim to exact length
    password = password.substring(0, length);

    PG.currentPassword = password;
    displayPassword(password);
}

// Shuffle string
function shuffleString(str) {
    var arr = str.split('');
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr.join('');
}

// Display password
function displayPassword(pw) {
    // Colorize password
    var html = '';
    for (var i = 0; i < pw.length; i++) {
        var ch = pw[i];
        var cls = 'pw-char';
        if (/[A-Z]/.test(ch)) cls += ' pw-upper';
        else if (/[a-z]/.test(ch)) cls += ' pw-lower';
        else if (/[0-9]/.test(ch)) cls += ' pw-num';
        else cls += ' pw-sym';
        html += '<span class="' + cls + '">' + escH(ch) + '</span>';
    }
    document.getElementById('pwDisplay').innerHTML = html;

    // Strength
    var strength = calcStrength(pw);
    document.getElementById('strengthBar').style.width = strength.percent + '%';
    document.getElementById('strengthBar').style.background = strength.color;
    document.getElementById('strengthLabel').textContent = strength.label;
    document.getElementById('strengthLabel').style.color = strength.color;

    // Stats
    document.getElementById('pwLength').textContent = pw.length;
    document.getElementById('pwEntropy').textContent = Math.round(strength.entropy) + ' bits';
    document.getElementById('pwCrackTime').textContent = strength.crackTime;

    // Composition
    var uppers = (pw.match(/[A-Z]/g) || []).length;
    var lowers = (pw.match(/[a-z]/g) || []).length;
    var nums = (pw.match(/[0-9]/g) || []).length;
    var syms = pw.length - uppers - lowers - nums;

    document.getElementById('compUpper').textContent = uppers;
    document.getElementById('compLower').textContent = lowers;
    document.getElementById('compNum').textContent = nums;
    document.getElementById('compSym').textContent = syms;

    // Composition bars
    var total = pw.length || 1;
    document.getElementById('barUpper').style.width = (uppers / total * 100) + '%';
    document.getElementById('barLower').style.width = (lowers / total * 100) + '%';
    document.getElementById('barNum').style.width = (nums / total * 100) + '%';
    document.getElementById('barSym').style.width = (syms / total * 100) + '%';
}

// Calculate strength
function calcStrength(pw) {
    var poolSize = 0;
    if (/[a-z]/.test(pw)) poolSize += 26;
    if (/[A-Z]/.test(pw)) poolSize += 26;
    if (/[0-9]/.test(pw)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;

    var entropy = pw.length * Math.log2(poolSize || 1);

    var percent, label, color, crackTime;

    if (entropy < 28) {
        percent = 10; label = 'Very Weak'; color = '#ef4444';
        crackTime = 'Instantly';
    } else if (entropy < 36) {
        percent = 25; label = 'Weak'; color = '#f97316';
        crackTime = 'Minutes';
    } else if (entropy < 60) {
        percent = 50; label = 'Fair'; color = '#f59e0b';
        crackTime = 'Hours to Days';
    } else if (entropy < 80) {
        percent = 75; label = 'Strong'; color = '#22c55e';
        crackTime = 'Years';
    } else if (entropy < 100) {
        percent = 90; label = 'Very Strong'; color = '#16a34a';
        crackTime = 'Centuries';
    } else {
        percent = 100; label = 'Excellent'; color = '#059669';
        crackTime = 'Billions of years';
    }

    return { percent: percent, label: label, color: color, entropy: entropy, crackTime: crackTime };
}

// ===== GENERATE MULTIPLE =====
function generateMultiple() {
    var count = parseInt(document.getElementById('multiCount').value) || 5;
    count = clamp(count, 1, 20);
    var list = document.getElementById('multiList');
    list.innerHTML = '';

    for (var i = 0; i < count; i++) {
        generatePassword(); // Updates PG.currentPassword
        var pw = PG.currentPassword;
        var strength = calcStrength(pw);

        var div = document.createElement('div');
        div.className = 'multi-item';
        div.innerHTML =
            '<span class="mi-num">' + (i + 1) + '</span>' +
            '<span class="mi-pw" style="font-family:monospace;font-weight:600;flex:1;word-break:break-all;">' + escH(pw) + '</span>' +
            '<span class="mi-str" style="color:' + strength.color + ';font-size:11px;font-weight:600;">' + strength.label + '</span>' +
            '<button class="mi-copy" onclick="copySingle(\'' + escH(pw).replace(/'/g, "\\'") + '\')"><i class="fas fa-copy"></i></button>';
        list.appendChild(div);
    }

    document.getElementById('multiSection').style.display = 'block';
    document.getElementById('multiSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== COPY =====
function copyPassword() {
    copyVal(PG.currentPassword);
}

function copySingle(pw) {
    copyVal(pw);
}

function copyVal(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showCopied();
        });
    } else {
        prompt('Copy:', text);
    }
}

function showCopied() {
    var el = document.getElementById('copiedMsg');
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 1500);
}

// ===== SAVE TO HISTORY =====
function saveToHistory() {
    if (PG.history.indexOf(PG.currentPassword) === -1) {
        PG.history.unshift(PG.currentPassword);
        if (PG.history.length > 10) PG.history.pop();
        renderHistory();
    }
}

function renderHistory() {
    var el = document.getElementById('historyList');
    el.innerHTML = '';

    if (PG.history.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:var(--text-light);font-size:12px;">No saved passwords yet</p>';
        return;
    }

    for (var i = 0; i < PG.history.length; i++) {
        var div = document.createElement('div');
        div.className = 'hist-item';
        div.innerHTML =
            '<span style="font-family:monospace;font-size:13px;flex:1;word-break:break-all;">' + escH(PG.history[i]) + '</span>' +
            '<button class="mi-copy" onclick="copySingle(\'' + escH(PG.history[i]).replace(/'/g, "\\'") + '\')"><i class="fas fa-copy"></i></button>';
        el.appendChild(div);
    }
}

function clearHistory() {
    PG.history = [];
    renderHistory();
}

// ===== QUICK PRESETS =====
function setPreset(type) {
    switch (type) {
        case 'pin':
            document.getElementById('lengthSlider').value = 4;
            document.getElementById('lengthInput').value = 4;
            document.getElementById('lengthVal').textContent = 4;
            document.getElementById('optUpper').checked = false;
            document.getElementById('optLower').checked = false;
            document.getElementById('optNumbers').checked = true;
            document.getElementById('optSymbols').checked = false;
            break;
        case 'simple':
            document.getElementById('lengthSlider').value = 8;
            document.getElementById('lengthInput').value = 8;
            document.getElementById('lengthVal').textContent = 8;
            document.getElementById('optUpper').checked = true;
            document.getElementById('optLower').checked = true;
            document.getElementById('optNumbers').checked = true;
            document.getElementById('optSymbols').checked = false;
            break;
        case 'strong':
            document.getElementById('lengthSlider').value = 16;
            document.getElementById('lengthInput').value = 16;
            document.getElementById('lengthVal').textContent = 16;
            document.getElementById('optUpper').checked = true;
            document.getElementById('optLower').checked = true;
            document.getElementById('optNumbers').checked = true;
            document.getElementById('optSymbols').checked = true;
            break;
        case 'ultra':
            document.getElementById('lengthSlider').value = 32;
            document.getElementById('lengthInput').value = 32;
            document.getElementById('lengthVal').textContent = 32;
            document.getElementById('optUpper').checked = true;
            document.getElementById('optLower').checked = true;
            document.getElementById('optNumbers').checked = true;
            document.getElementById('optSymbols').checked = true;
            break;
    }
    generatePassword();
}

// Toggle password visibility
function toggleVisibility() {
    var el = document.getElementById('pwDisplay');
    var btn = document.getElementById('visBtn');
    if (el.style.filter === 'blur(8px)') {
        el.style.filter = 'none';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        el.style.filter = 'blur(8px)';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Helpers
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function escH(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

console.log('Password Generator loaded');