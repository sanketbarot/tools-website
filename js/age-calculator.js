// ==========================================
// AGE CALCULATOR - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var today = new Date().toISOString().split('T')[0];
    var dobEl = document.getElementById('dobInput');
    var todayEl = document.getElementById('todayInput');
    if (dobEl) dobEl.max = today;
    if (todayEl) todayEl.value = today;
    console.log('Age Calculator ready');
});

// ===== CALCULATE =====
function calculateAge() {
    hideE();

    var dobVal = document.getElementById('dobInput').value;
    var todayVal = document.getElementById('todayInput').value;

    if (!dobVal) {
        showE('Please enter your date of birth!');
        return;
    }

    var dob = new Date(dobVal);
    var today = todayVal ? new Date(todayVal) : new Date();

    if (isNaN(dob.getTime())) {
        showE('Invalid date of birth!');
        return;
    }

    if (dob > today) {
        showE('Date of birth cannot be in the future!');
        return;
    }

    // Calculate years, months, days
    var years = today.getFullYear() - dob.getFullYear();
    var months = today.getMonth() - dob.getMonth();
    var days = today.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        var prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Total calculations
    var diffMs = today.getTime() - dob.getTime();
    var totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var totalWeeks = Math.floor(totalDays / 7);
    var totalMonths = years * 12 + months;
    var totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    var totalMinutes = Math.floor(diffMs / (1000 * 60));
    var totalSeconds = Math.floor(diffMs / 1000);

    // Display results
    document.getElementById('ageBig').textContent = years;
    document.getElementById('rYears').textContent = years;
    document.getElementById('rMonths').textContent = months;
    document.getElementById('rDays').textContent = days;

    document.getElementById('totalMonths').textContent = totalMonths.toLocaleString();
    document.getElementById('totalWeeks').textContent = totalWeeks.toLocaleString();
    document.getElementById('totalDays').textContent = totalDays.toLocaleString();
    document.getElementById('totalHours').textContent = totalHours.toLocaleString();
    document.getElementById('totalMinutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('totalSeconds').textContent = totalSeconds.toLocaleString();

    // Next birthday
    calcNextBirthday(dob, today);

    // Born on day
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    document.getElementById('bornDay').textContent = dayNames[dob.getDay()];

    // Zodiac
    setZodiac(dob);

    // Chinese zodiac
    setChineseZodiac(dob);

    // Birthstone
    setBirthstone(dob);

    // Fun facts
    setFunFacts(years, totalDays, totalHours, dob);

    // Show results
    var resultArea = document.getElementById('resultArea');
    resultArea.style.display = 'block';
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Live seconds counter
    startLiveCounter(dob);
}

// ===== NEXT BIRTHDAY =====
function calcNextBirthday(dob, today) {
    var nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday <= today) {
        nextBday.setFullYear(nextBday.getFullYear() + 1);
    }

    var daysUntil = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    document.getElementById('nbCountdown').textContent = daysUntil + ' days to go!';
    document.getElementById('nbDate').textContent = monthNames[nextBday.getMonth()] + ' ' + nextBday.getDate() + ', ' + nextBday.getFullYear();
    document.getElementById('nbDay').textContent = dayNames[nextBday.getDay()];

    if (daysUntil === 0 || daysUntil === 365 || daysUntil === 366) {
        document.getElementById('nbCountdown').textContent = '🎉 Happy Birthday! 🎂';
        document.getElementById('nbDate').textContent = 'Today is your birthday!';
        document.getElementById('nbDay').textContent = '🥳 Celebrate!';
    }
}

// ===== ZODIAC =====
function setZodiac(dob) {
    var m = dob.getMonth() + 1;
    var d = dob.getDate();
    var signs = [
        { name:'Capricorn', icon:'♑', s:[1,1], e:[1,19] },
        { name:'Aquarius', icon:'♒', s:[1,20], e:[2,18] },
        { name:'Pisces', icon:'♓', s:[2,19], e:[3,20] },
        { name:'Aries', icon:'♈', s:[3,21], e:[4,19] },
        { name:'Taurus', icon:'♉', s:[4,20], e:[5,20] },
        { name:'Gemini', icon:'♊', s:[5,21], e:[6,20] },
        { name:'Cancer', icon:'♋', s:[6,21], e:[7,22] },
        { name:'Leo', icon:'♌', s:[7,23], e:[8,22] },
        { name:'Virgo', icon:'♍', s:[8,23], e:[9,22] },
        { name:'Libra', icon:'♎', s:[9,23], e:[10,22] },
        { name:'Scorpio', icon:'♏', s:[10,23], e:[11,21] },
        { name:'Sagittarius', icon:'♐', s:[11,22], e:[12,21] },
        { name:'Capricorn', icon:'♑', s:[12,22], e:[12,31] }
    ];

    var zodiac = signs[0];
    for (var i = 0; i < signs.length; i++) {
        if ((m === signs[i].s[0] && d >= signs[i].s[1]) ||
            (m === signs[i].e[0] && d <= signs[i].e[1])) {
            zodiac = signs[i];
            break;
        }
    }

    document.getElementById('zodiacIcon').textContent = zodiac.icon;
    document.getElementById('zodiacName').textContent = zodiac.name;
}

// ===== CHINESE ZODIAC =====
function setChineseZodiac(dob) {
    var animals = [
        { name:'Rat', icon:'🐀' }, { name:'Ox', icon:'🐂' },
        { name:'Tiger', icon:'🐅' }, { name:'Rabbit', icon:'🐇' },
        { name:'Dragon', icon:'🐉' }, { name:'Snake', icon:'🐍' },
        { name:'Horse', icon:'🐎' }, { name:'Goat', icon:'🐐' },
        { name:'Monkey', icon:'🐒' }, { name:'Rooster', icon:'🐓' },
        { name:'Dog', icon:'🐕' }, { name:'Pig', icon:'🐖' }
    ];
    var idx = (dob.getFullYear() - 1900) % 12;
    if (idx < 0) idx += 12;
    document.getElementById('chineseIcon').textContent = animals[idx].icon;
    document.getElementById('chineseName').textContent = animals[idx].name;
}

// ===== BIRTHSTONE =====
function setBirthstone(dob) {
    var stones = [
        { name:'Garnet', icon:'🔴' }, { name:'Amethyst', icon:'🟣' },
        { name:'Aquamarine', icon:'🔵' }, { name:'Diamond', icon:'💎' },
        { name:'Emerald', icon:'🟢' }, { name:'Pearl', icon:'⚪' },
        { name:'Ruby', icon:'🔴' }, { name:'Peridot', icon:'🟢' },
        { name:'Sapphire', icon:'🔵' }, { name:'Opal', icon:'🌈' },
        { name:'Topaz', icon:'🟡' }, { name:'Turquoise', icon:'🔵' }
    ];
    var stone = stones[dob.getMonth()];
    document.getElementById('birthstone').textContent = stone.icon;
    document.getElementById('birthstoneName').textContent = stone.name;
}

// ===== FUN FACTS =====
function setFunFacts(years, totalDays, totalHours, dob) {
    var facts = [];
    facts.push({ icon:'fas fa-heartbeat', text:'Heart has beaten ~<strong>' + (totalDays * 100000).toLocaleString() + '</strong> times' });
    facts.push({ icon:'fas fa-lungs', text:'You have taken ~<strong>' + (totalDays * 23000).toLocaleString() + '</strong> breaths' });
    facts.push({ icon:'fas fa-moon', text:'You have slept ~<strong>' + Math.floor(totalHours / 3).toLocaleString() + '</strong> hours' });
    facts.push({ icon:'fas fa-utensils', text:'You have eaten ~<strong>' + (totalDays * 3).toLocaleString() + '</strong> meals' });
    facts.push({ icon:'fas fa-walking', text:'You have taken ~<strong>' + (totalDays * 7500).toLocaleString() + '</strong> steps' });

    var isLeap = (dob.getFullYear() % 4 === 0 && (dob.getFullYear() % 100 !== 0 || dob.getFullYear() % 400 === 0));
    if (isLeap) {
        facts.push({ icon:'fas fa-calendar-check', text:'You were born in a <strong>leap year!</strong>' });
    }

    var container = document.getElementById('funFacts');
    container.innerHTML = '';
    for (var i = 0; i < facts.length; i++) {
        var div = document.createElement('div');
        div.className = 'fun-fact';
        div.innerHTML = '<i class="' + facts[i].icon + '"></i> ' + facts[i].text;
        container.appendChild(div);
    }
}

// ===== LIVE COUNTER =====
var liveTimer = null;
function startLiveCounter(dob) {
    if (liveTimer) clearInterval(liveTimer);
    liveTimer = setInterval(function() {
        var now = new Date();
        var diff = Math.floor((now.getTime() - dob.getTime()) / 1000);
        var el = document.getElementById('totalSeconds');
        if (el) el.textContent = diff.toLocaleString();
    }, 1000);
}

// ===== SHARE =====
function copyResult() {
    var y = document.getElementById('rYears').textContent;
    var m = document.getElementById('rMonths').textContent;
    var d = document.getElementById('rDays').textContent;
    var text = 'I am ' + y + ' years, ' + m + ' months, ' + d + ' days old! 🎂 Calculate yours free!';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else {
        prompt('Copy this:', text);
    }
}

function shareWhatsApp() {
    var y = document.getElementById('rYears').textContent;
    var m = document.getElementById('rMonths').textContent;
    var d = document.getElementById('rDays').textContent;
    var text = 'I am ' + y + ' years, ' + m + ' months, ' + d + ' days old! 🎂';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function shareTwitter() {
    var y = document.getElementById('rYears').textContent;
    var m = document.getElementById('rMonths').textContent;
    var d = document.getElementById('rDays').textContent;
    var text = 'I am ' + y + ' years, ' + m + ' months, ' + d + ' days old! 🎂 #AgeCalculator';
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
}

// ===== HELPERS =====
function showE(m) {
    var el = document.getElementById('em');
    var t = document.getElementById('et');
    if (el && t) { t.textContent = m; el.style.display = 'block'; }
    setTimeout(hideE, 8000);
}
function hideE() {
    var el = document.getElementById('em');
    if (el) el.style.display = 'none';
}

console.log('Age Calculator JS loaded');