// ==========================================
// DISCOUNT CALCULATOR - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('origPrice').value = 1000;
    document.getElementById('discPct').value = 20;
});

// Calculate discount
function calcDiscount() {
    hideE();

    var price = parseFloat(document.getElementById('origPrice').value);
    var discount = parseFloat(document.getElementById('discPct').value);
    var extraDisc = parseFloat(document.getElementById('extraDisc').value) || 0;
    var taxPct = parseFloat(document.getElementById('taxPct').value) || 0;
    var qty = parseInt(document.getElementById('qtyInput').value) || 1;

    if (!price || price <= 0) { showE('Enter valid original price!'); return; }
    if (isNaN(discount) || discount < 0 || discount > 100) { showE('Enter valid discount (0-100%)!'); return; }

    // Single item calculation
    var discAmt = (discount / 100) * price;
    var afterDisc = price - discAmt;

    // Extra discount (on discounted price)
    var extraAmt = 0;
    if (extraDisc > 0) {
        extraAmt = (extraDisc / 100) * afterDisc;
        afterDisc = afterDisc - extraAmt;
    }

    // Tax
    var taxAmt = 0;
    if (taxPct > 0) {
        taxAmt = (taxPct / 100) * afterDisc;
    }
    var finalPrice = afterDisc + taxAmt;

    // Total savings
    var totalSaved = price - afterDisc;
    var totalSavedPct = (totalSaved / price) * 100;

    // Quantity
    var totalPrice = finalPrice * qty;
    var totalSavings = (price * qty) - (afterDisc * qty);

    // Display results
    document.getElementById('rFinal').textContent = '₹' + fmtNum(finalPrice);
    document.getElementById('rSaved').textContent = '₹' + fmtNum(totalSaved);
    document.getElementById('rSavedPct').textContent = totalSavedPct.toFixed(1) + '%';
    document.getElementById('rOriginal').textContent = '₹' + fmtNum(price);
    document.getElementById('rDiscount').textContent = '-₹' + fmtNum(discAmt) + ' (' + discount + '%)';

    // Extra discount
    var extraRow = document.getElementById('extraRow');
    if (extraDisc > 0) {
        extraRow.style.display = 'flex';
        document.getElementById('rExtra').textContent = '-₹' + fmtNum(extraAmt) + ' (' + extraDisc + '%)';
    } else {
        extraRow.style.display = 'none';
    }

    // Tax
    var taxRow = document.getElementById('taxRow');
    if (taxPct > 0) {
        taxRow.style.display = 'flex';
        document.getElementById('rTax').textContent = '+₹' + fmtNum(taxAmt) + ' (' + taxPct + '%)';
    } else {
        taxRow.style.display = 'none';
    }

    // Quantity
    var qtySection = document.getElementById('qtySection');
    if (qty > 1) {
        qtySection.style.display = 'block';
        document.getElementById('rQty').textContent = qty;
        document.getElementById('rTotalPrice').textContent = '₹' + fmtNum(totalPrice);
        document.getElementById('rTotalSaved').textContent = '₹' + fmtNum(totalSavings);
    } else {
        qtySection.style.display = 'none';
    }

    // Savings bar
    var barPct = Math.min(totalSavedPct, 100);
    document.getElementById('savingsBar').style.width = barPct + '%';
    document.getElementById('savingsBarText').textContent = totalSavedPct.toFixed(1) + '% saved';

    // Price comparison
    document.getElementById('priceOrig').textContent = '₹' + fmtNum(price);
    document.getElementById('priceFinal').textContent = '₹' + fmtNum(finalPrice);

    // Discount comparison table
    buildCompareTable(price);

    // Show result
    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// Build comparison table
function buildCompareTable(price) {
    var discounts = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80];
    var grid = document.getElementById('compareGrid');
    grid.innerHTML = '';

    for (var i = 0; i < discounts.length; i++) {
        var d = discounts[i];
        var saved = (d / 100) * price;
        var final = price - saved;
        var isActive = (d === parseFloat(document.getElementById('discPct').value));

        var card = document.createElement('div');
        card.className = 'cmp-card' + (isActive ? ' active' : '');
        card.onclick = (function(disc) {
            return function() {
                document.getElementById('discPct').value = disc;
                calcDiscount();
            };
        })(d);

        card.innerHTML =
            '<div class="cmp-pct">' + d + '%</div>' +
            '<div class="cmp-save">Save ₹' + fmtNum(saved) + '</div>' +
            '<div class="cmp-final">₹' + fmtNum(final) + '</div>';

        grid.appendChild(card);
    }
}

// Quick discount buttons
function setDiscount(val) {
    document.getElementById('discPct').value = val;
}

// Quick price buttons
function setPrice(val) {
    document.getElementById('origPrice').value = val;
}

// Format number Indian style
function fmtNum(num) {
    num = Math.round(num * 100) / 100;
    var parts = num.toFixed(2).split('.');
    var intPart = parts[0];
    var decPart = parts[1];

    var lastThree = intPart.substring(intPart.length - 3);
    var remaining = intPart.substring(0, intPart.length - 3);
    if (remaining !== '') lastThree = ',' + lastThree;
    var formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return formatted + '.' + decPart;
}

// Copy result
function copyDiscount() {
    var orig = document.getElementById('rOriginal').textContent;
    var disc = document.getElementById('rDiscount').textContent;
    var final = document.getElementById('rFinal').textContent;
    var saved = document.getElementById('rSaved').textContent;
    var text = 'Original: ' + orig + ' | Discount: ' + disc + ' | Final: ' + final + ' | Saved: ' + saved;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else { prompt('Copy:', text); }
}

function shareDiscount(platform) {
    var final = document.getElementById('rFinal').textContent;
    var saved = document.getElementById('rSaved').textContent;
    var pct = document.getElementById('rSavedPct').textContent;
    var text = 'Got ' + pct + ' discount! Final price: ' + final + ' (Saved ' + saved + ')';

    if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    } else if (platform === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
    }
}

// Clear
function clearAll() {
    document.getElementById('origPrice').value = '';
    document.getElementById('discPct').value = '';
    document.getElementById('extraDisc').value = '';
    document.getElementById('taxPct').value = '';
    document.getElementById('qtyInput').value = 1;
    document.getElementById('resultArea').style.display = 'none';
}

// Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var active = document.activeElement;
        if (active && active.tagName === 'INPUT') calcDiscount();
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

console.log('Discount Calculator loaded');