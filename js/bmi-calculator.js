// ==========================================
// BMI CALCULATOR - COMPLETE WORKING
// ==========================================

// Set defaults on load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('heightCm').value = 170;
    document.getElementById('weightKg').value = 70;
    document.getElementById('ageInput').value = 25;
});

// Unit toggle
var useMetric = true;

function setUnit(metric, el) {
    useMetric = metric;
    document.querySelectorAll('.unit-btn').forEach(function(b) { b.classList.remove('on'); });
    el.classList.add('on');
    document.getElementById('metricBox').style.display = metric ? 'block' : 'none';
    document.getElementById('imperialBox').style.display = metric ? 'none' : 'block';
}

// ===== CALCULATE BMI =====
function calculateBMI() {
    hideE();
    var height, weight;

    if (useMetric) {
        height = parseFloat(document.getElementById('heightCm').value);
        weight = parseFloat(document.getElementById('weightKg').value);
        if (!height || !weight || height <= 0 || weight <= 0) {
            showE('Please enter valid height and weight!');
            return;
        }
        height = height / 100; // cm to meters
    } else {
        var feet = parseFloat(document.getElementById('heightFt').value) || 0;
        var inches = parseFloat(document.getElementById('heightIn').value) || 0;
        weight = parseFloat(document.getElementById('weightLbs').value);
        if ((!feet && !inches) || !weight || weight <= 0) {
            showE('Please enter valid height and weight!');
            return;
        }
        var totalInches = (feet * 12) + inches;
        height = totalInches * 0.0254;
        weight = weight * 0.453592;
    }

    // BMI = weight(kg) / height(m)²
    var bmi = weight / (height * height);
    bmi = Math.round(bmi * 10) / 10;

    // Category
    var cat, color, emoji, advice;
    if (bmi < 16) {
        cat = 'Severely Underweight'; color = '#ef4444'; emoji = '⚠️';
        advice = 'Your weight is significantly below healthy range. Please consult a doctor.';
    } else if (bmi < 18.5) {
        cat = 'Underweight'; color = '#f97316'; emoji = '🟠';
        advice = 'Consider gaining some weight with a balanced diet.';
    } else if (bmi < 25) {
        cat = 'Normal Weight'; color = '#22c55e'; emoji = '✅';
        advice = 'Great! You are at a healthy weight. Keep it up!';
    } else if (bmi < 30) {
        cat = 'Overweight'; color = '#f59e0b'; emoji = '🟡';
        advice = 'Consider more exercise and a balanced diet.';
    } else if (bmi < 35) {
        cat = 'Obese (Class I)'; color = '#ef4444'; emoji = '🔴';
        advice = 'Consult a healthcare provider about weight management.';
    } else if (bmi < 40) {
        cat = 'Obese (Class II)'; color = '#dc2626'; emoji = '🔴';
        advice = 'Please seek medical advice for weight management.';
    } else {
        cat = 'Obese (Class III)'; color = '#991b1b'; emoji = '🚨';
        advice = 'Severe obesity. Please consult a doctor immediately.';
    }

    // Healthy weight range
    var minW = Math.round(18.5 * height * height * 10) / 10;
    var maxW = Math.round(24.9 * height * height * 10) / 10;
    var idealW = Math.round(22 * height * height * 10) / 10;
    var diff = Math.round((weight - idealW) * 10) / 10;

    // Age & gender for extra calculations
    var age = parseInt(document.getElementById('ageInput').value) || 25;
    var gender = document.getElementById('genderInput').value;

    // Body fat estimate
    var bodyFat;
    if (gender === 'male') {
        bodyFat = Math.round((1.20 * bmi + 0.23 * age - 16.2) * 10) / 10;
    } else {
        bodyFat = Math.round((1.20 * bmi + 0.23 * age - 5.4) * 10) / 10;
    }
    bodyFat = Math.max(3, Math.min(bodyFat, 60));

    // BMR (Basal Metabolic Rate)
    var bmr;
    if (gender === 'male') {
        bmr = Math.round(88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age));
    } else {
        bmr = Math.round(447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age));
    }

    // Water intake
    var water = Math.round(weight * 0.033 * 10) / 10;

    // BMI Prime
    var bmiPrime = Math.round((bmi / 25) * 100) / 100;

    // Ponderal Index
    var pi = Math.round((weight / (height * height * height)) * 10) / 10;

    // ===== DISPLAY RESULTS =====
    document.getElementById('bmiValue').textContent = bmi;
    document.getElementById('bmiValue').style.color = color;
    document.getElementById('bmiCat').textContent = emoji + ' ' + cat;
    document.getElementById('bmiCat').style.color = color;
    document.getElementById('bmiAdvice').textContent = advice;

    // Gauge
    var gaugePct = Math.min(Math.max((bmi / 50) * 100, 2), 98);
    document.getElementById('gaugeNeedle').style.left = gaugePct + '%';

    // Info boxes
    document.getElementById('rRange').textContent = minW + ' - ' + maxW + ' kg';
    document.getElementById('rIdeal').textContent = idealW + ' kg';

    var diffEl = document.getElementById('rDiff');
    if (diff > 0) {
        diffEl.textContent = '+' + diff + ' kg (above ideal)';
        diffEl.style.color = '#ef4444';
    } else if (diff < 0) {
        diffEl.textContent = diff + ' kg (below ideal)';
        diffEl.style.color = '#f59e0b';
    } else {
        diffEl.textContent = 'Perfect! At ideal weight';
        diffEl.style.color = '#22c55e';
    }

    document.getElementById('rFat').textContent = bodyFat + '%';
    document.getElementById('rCalories').textContent = bmr.toLocaleString() + ' cal/day';
    document.getElementById('rWater').textContent = water + ' liters/day';
    document.getElementById('rPrime').textContent = bmiPrime;
    document.getElementById('rPonderal').textContent = pi + ' kg/m³';

    // Show result
    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// ===== SHARE =====
function copyBMI() {
    var bmi = document.getElementById('bmiValue').textContent;
    var cat = document.getElementById('bmiCat').textContent;
    var text = 'My BMI is ' + bmi + ' (' + cat + '). Calculate yours free!';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else { prompt('Copy:', text); }
}

function shareBMI(platform) {
    var bmi = document.getElementById('bmiValue').textContent;
    var cat = document.getElementById('bmiCat').textContent;
    var text = 'My BMI is ' + bmi + ' (' + cat + '). Calculate yours!';
    if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    } else if (platform === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
    }
}

// ===== HELPERS =====
function showE(m) {
    var el = document.getElementById('em'), t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 8000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('BMI Calculator loaded');