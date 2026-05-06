// ==========================================
// EMI CALCULATOR - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loanAmount').value = 500000;
    document.getElementById('interestRate').value = 8.5;
    document.getElementById('loanTenure').value = 5;
});

function calculateEMI() {
    hideE();

    var P = parseFloat(document.getElementById('loanAmount').value);
    var annualRate = parseFloat(document.getElementById('interestRate').value);
    var years = parseFloat(document.getElementById('loanTenure').value);
    var tenureType = document.getElementById('tenureType').value;

    if (!P || P <= 0) { showE('Enter valid loan amount!'); return; }
    if (!annualRate || annualRate <= 0) { showE('Enter valid interest rate!'); return; }
    if (!years || years <= 0) { showE('Enter valid tenure!'); return; }

    // Convert to months
    var months = tenureType === 'years' ? years * 12 : years;
    var monthlyRate = annualRate / 12 / 100;

    // EMI Formula: [P × R × (1+R)^N] / [(1+R)^N - 1]
    var emi;
    if (monthlyRate === 0) {
        emi = P / months;
    } else {
        var factor = Math.pow(1 + monthlyRate, months);
        emi = (P * monthlyRate * factor) / (factor - 1);
    }

    var totalPayment = emi * months;
    var totalInterest = totalPayment - P;
    var interestPercent = Math.round((totalInterest / totalPayment) * 100);
    var principalPercent = 100 - interestPercent;

    // Display
    document.getElementById('rEmi').textContent = '₹' + formatNum(Math.round(emi));
    document.getElementById('rTotal').textContent = '₹' + formatNum(Math.round(totalPayment));
    document.getElementById('rInterest').textContent = '₹' + formatNum(Math.round(totalInterest));
    document.getElementById('rPrincipal').textContent = '₹' + formatNum(Math.round(P));
    document.getElementById('rMonths').textContent = Math.round(months);
    document.getElementById('rRate').textContent = annualRate + '%';

    // Pie chart (CSS)
    var pieEl = document.getElementById('pieChart');
    pieEl.style.background = 'conic-gradient(#6366f1 0% ' + principalPercent + '%, #ec4899 ' + principalPercent + '% 100%)';
    document.getElementById('piePrincipal').textContent = principalPercent + '% Principal';
    document.getElementById('pieInterest').textContent = interestPercent + '% Interest';

    // Monthly breakdown table
    buildSchedule(P, monthlyRate, months, emi);

    // Year-wise summary
    buildYearSummary(P, monthlyRate, months, emi);

    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// Monthly amortization schedule
function buildSchedule(principal, monthlyRate, totalMonths, emi) {
    var tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    var balance = principal;
    var maxRows = Math.min(totalMonths, 60); // Show max 60 months

    for (var i = 1; i <= maxRows; i++) {
        var interestPaid = balance * monthlyRate;
        var principalPaid = emi - interestPaid;
        balance = balance - principalPaid;
        if (balance < 0) balance = 0;

        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + i + '</td>' +
            '<td>₹' + formatNum(Math.round(emi)) + '</td>' +
            '<td>₹' + formatNum(Math.round(principalPaid)) + '</td>' +
            '<td>₹' + formatNum(Math.round(interestPaid)) + '</td>' +
            '<td>₹' + formatNum(Math.round(balance)) + '</td>';
        tbody.appendChild(tr);
    }

    if (totalMonths > 60) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" style="text-align:center;color:var(--text-light);">... ' + (totalMonths - 60) + ' more months</td>';
        tbody.appendChild(tr);
    }
}

// Year-wise summary
function buildYearSummary(principal, monthlyRate, totalMonths, emi) {
    var container = document.getElementById('yearSummary');
    container.innerHTML = '';

    var balance = principal;
    var totalYears = Math.ceil(totalMonths / 12);

    for (var y = 1; y <= totalYears; y++) {
        var yearPrincipal = 0;
        var yearInterest = 0;
        var monthsInYear = Math.min(12, totalMonths - (y - 1) * 12);

        for (var m = 1; m <= monthsInYear; m++) {
            var interest = balance * monthlyRate;
            var princ = emi - interest;
            yearPrincipal += princ;
            yearInterest += interest;
            balance -= princ;
            if (balance < 0) balance = 0;
        }

        var div = document.createElement('div');
        div.className = 'yr-card';
        div.innerHTML =
            '<div class="yr-num">Year ' + y + '</div>' +
            '<div class="yr-row"><span>Principal</span><strong>₹' + formatNum(Math.round(yearPrincipal)) + '</strong></div>' +
            '<div class="yr-row"><span>Interest</span><strong>₹' + formatNum(Math.round(yearInterest)) + '</strong></div>' +
            '<div class="yr-row"><span>Balance</span><strong>₹' + formatNum(Math.round(Math.max(balance, 0))) + '</strong></div>';
        container.appendChild(div);
    }
}

// Format number with commas (Indian style)
function formatNum(num) {
    var str = num.toString();
    var lastThree = str.substring(str.length - 3);
    var remaining = str.substring(0, str.length - 3);
    if (remaining !== '') {
        lastThree = ',' + lastThree;
    }
    return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

// Quick amount buttons
function setAmount(val) {
    document.getElementById('loanAmount').value = val;
}

// Copy result
function copyEMI() {
    var emi = document.getElementById('rEmi').textContent;
    var total = document.getElementById('rTotal').textContent;
    var interest = document.getElementById('rInterest').textContent;
    var text = 'EMI: ' + emi + ' | Total: ' + total + ' | Interest: ' + interest;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else { prompt('Copy:', text); }
}

function shareEMI(platform) {
    var emi = document.getElementById('rEmi').textContent;
    var text = 'My loan EMI is ' + emi + '/month. Calculate yours!';
    if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    } else if (platform === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
    }
}

// Toggle schedule visibility
function toggleSchedule() {
    var el = document.getElementById('scheduleWrap');
    var btn = document.getElementById('toggleBtn');
    if (el.style.display === 'none') {
        el.style.display = 'block';
        btn.textContent = 'Hide Schedule';
    } else {
        el.style.display = 'none';
        btn.textContent = 'Show Monthly Schedule';
    }
}

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

console.log('EMI Calculator loaded');