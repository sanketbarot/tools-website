// ==========================================
// PERCENTAGE CALCULATOR - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    setMode('basic', document.querySelector('.mode-btn'));
});

// Current mode
var currentMode = 'basic';

// Switch mode
function setMode(mode, el) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('on'); });
    if (el) el.classList.add('on');

    var labels = {
        basic:       ['Percentage (%)', 'Number', 'What is X% of Y?'],
        increase:    ['Original Number', 'Increase by (%)', 'Increase a number by percentage'],
        decrease:    ['Original Number', 'Decrease by (%)', 'Decrease a number by percentage'],
        change:      ['Old Value', 'New Value', 'Find percentage change between two values'],
        whatpercent: ['Part (Number)', 'Whole (Total)', 'X is what percent of Y?'],
        tipCalc:     ['Bill Amount', 'Tip (%)', 'Calculate tip amount']
    };

    var lb = labels[mode] || labels.basic;
    document.getElementById('label1').textContent = lb[0];
    document.getElementById('label2').textContent = lb[1];
    document.getElementById('modeDesc').textContent = lb[2];
    document.getElementById('inp1').value = '';
    document.getElementById('inp2').value = '';
    document.getElementById('inp1').placeholder = 'Enter ' + lb[0].toLowerCase();
    document.getElementById('inp2').placeholder = 'Enter ' + lb[1].toLowerCase();
    document.getElementById('resultArea').style.display = 'none';

    // Set default for tip
    if (mode === 'tipCalc') {
        document.getElementById('inp2').value = '15';
    }
}

// Calculate
function calcPercentage() {
    hideE();

    var v1 = parseFloat(document.getElementById('inp1').value);
    var v2 = parseFloat(document.getElementById('inp2').value);

    if (isNaN(v1)) { showE('Please enter first value!'); return; }
    if (isNaN(v2)) { showE('Please enter second value!'); return; }

    var result, question, answer, formula, extra;

    switch (currentMode) {
        case 'basic':
            result = (v1 / 100) * v2;
            question = 'What is ' + v1 + '% of ' + v2 + '?';
            answer = result.toFixed(2);
            formula = '(' + v1 + ' ÷ 100) × ' + v2 + ' = ' + result.toFixed(2);
            extra = buildExtras(v2, [5, 10, 15, 20, 25, 50, 75]);
            break;

        case 'increase':
            var inc = (v2 / 100) * v1;
            result = v1 + inc;
            question = v1 + ' increased by ' + v2 + '%';
            answer = result.toFixed(2);
            formula = v1 + ' + (' + v2 + '% of ' + v1 + ') = ' + v1 + ' + ' + inc.toFixed(2) + ' = ' + result.toFixed(2);
            extra = null;
            break;

        case 'decrease':
            var dec = (v2 / 100) * v1;
            result = v1 - dec;
            question = v1 + ' decreased by ' + v2 + '%';
            answer = result.toFixed(2);
            formula = v1 + ' - (' + v2 + '% of ' + v1 + ') = ' + v1 + ' - ' + dec.toFixed(2) + ' = ' + result.toFixed(2);
            extra = null;
            break;

        case 'change':
            if (v1 === 0) { showE('Old value cannot be zero!'); return; }
            var change = ((v2 - v1) / Math.abs(v1)) * 100;
            var dir = change >= 0 ? '📈 Increase' : '📉 Decrease';
            question = 'Change from ' + v1 + ' to ' + v2;
            answer = Math.abs(change).toFixed(2) + '%';
            formula = dir + ' | Difference: ' + (v2 - v1).toFixed(2) + ' | ' + Math.abs(change).toFixed(2) + '%';
            extra = null;
            break;

        case 'whatpercent':
            if (v2 === 0) { showE('Total cannot be zero!'); return; }
            result = (v1 / v2) * 100;
            question = v1 + ' is what % of ' + v2 + '?';
            answer = result.toFixed(2) + '%';
            formula = '(' + v1 + ' ÷ ' + v2 + ') × 100 = ' + result.toFixed(2) + '%';
            extra = null;
            break;

        case 'tipCalc':
            var tip = (v2 / 100) * v1;
            result = v1 + tip;
            question = 'Bill: ₹' + v1 + ' with ' + v2 + '% tip';
            answer = '₹' + result.toFixed(2);
            formula = 'Tip: ₹' + tip.toFixed(2) + ' | Total: ₹' + result.toFixed(2);

            // Split bill
            extra = buildTipSplit(v1, tip, result);
            break;
    }

    // Display
    document.getElementById('resQuestion').textContent = question;
    document.getElementById('resAnswer').textContent = answer;
    document.getElementById('resFormula').textContent = formula;

    // Extra content
    var extraEl = document.getElementById('extraContent');
    if (extra) {
        extraEl.innerHTML = extra;
        extraEl.style.display = 'block';
    } else {
        extraEl.style.display = 'none';
    }

    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// Build percentage table for basic mode
function buildExtras(num, percents) {
    var html = '<div class="extra-title"><i class="fas fa-table"></i> Quick Reference for ' + num + '</div>';
    html += '<div class="extra-grid">';
    for (var i = 0; i < percents.length; i++) {
        var val = (percents[i] / 100) * num;
        html += '<div class="extra-item">';
        html += '<span class="ei-pct">' + percents[i] + '%</span>';
        html += '<span class="ei-val">' + val.toFixed(2) + '</span>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// Build tip split table
function buildTipSplit(bill, tip, total) {
    var html = '<div class="extra-title"><i class="fas fa-users"></i> Split Bill</div>';
    html += '<div class="extra-grid">';
    for (var p = 2; p <= 6; p++) {
        html += '<div class="extra-item">';
        html += '<span class="ei-pct">' + p + ' people</span>';
        html += '<span class="ei-val">₹' + (total / p).toFixed(2) + ' each</span>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// Quick calc
function quickCalc(pct, num) {
    setMode('basic', document.querySelector('[data-mode="basic"]'));
    document.getElementById('inp1').value = pct;
    document.getElementById('inp2').value = num;
    calcPercentage();
}

// Copy result
function copyResult() {
    var q = document.getElementById('resQuestion').textContent;
    var a = document.getElementById('resAnswer').textContent;
    var text = q + ' = ' + a;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else { prompt('Copy:', text); }
}

// Clear
function clearAll() {
    document.getElementById('inp1').value = '';
    document.getElementById('inp2').value = '';
    document.getElementById('resultArea').style.display = 'none';
}

// Enter key to calculate
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var active = document.activeElement;
        if (active && (active.id === 'inp1' || active.id === 'inp2')) {
            calcPercentage();
        }
    }
});

// Helpers
function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 8000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('Percentage Calculator loaded');