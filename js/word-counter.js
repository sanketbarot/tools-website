// ==========================================
// WORD COUNTER - COMPLETE WORKING
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('textInput');
    if (textarea) {
        textarea.addEventListener('input', analyzeText);
        textarea.addEventListener('paste', function() {
            setTimeout(analyzeText, 50);
        });
    }
});

function analyzeText() {
    var text = document.getElementById('textInput').value;

    // Words
    var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    // Characters
    var chars = text.length;
    var charsNoSpace = text.replace(/\s/g, '').length;

    // Sentences
    var sentences = text.trim() === '' ? 0 : text.split(/[.!?।]+/).filter(function(s) { return s.trim().length > 0; }).length;

    // Paragraphs
    var paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(function(p) { return p.trim().length > 0; }).length;
    if (paragraphs === 0 && text.trim().length > 0) paragraphs = 1;

    // Lines
    var lines = text.trim() === '' ? 0 : text.split('\n').filter(function(l) { return l.trim().length > 0; }).length;

    // Syllables (approximate)
    var syllables = countSyllables(text);

    // Reading time (avg 200 wpm)
    var readMin = Math.ceil(words / 200);
    var readSec = Math.round((words / 200) * 60);
    var readTime = readMin < 1 ? readSec + ' sec' : readMin + ' min';

    // Speaking time (avg 150 wpm)
    var speakMin = Math.ceil(words / 150);
    var speakSec = Math.round((words / 150) * 60);
    var speakTime = speakMin < 1 ? speakSec + ' sec' : speakMin + ' min';

    // Avg word length
    var avgWordLen = words > 0 ? (charsNoSpace / words).toFixed(1) : '0';

    // Avg sentence length
    var avgSentLen = sentences > 0 ? Math.round(words / sentences) : 0;

    // Longest word
    var longestWord = '';
    if (words > 0) {
        var allWords = text.trim().split(/\s+/);
        for (var i = 0; i < allWords.length; i++) {
            var clean = allWords[i].replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
            if (clean.length > longestWord.length) longestWord = clean;
        }
    }

    // Readability (Flesch-Kincaid)
    var readability = 0;
    var readLabel = '-';
    var readColor = '#94a3b8';
    if (words > 0 && sentences > 0) {
        readability = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        readability = Math.max(0, Math.min(100, Math.round(readability)));

        if (readability >= 80) { readLabel = 'Very Easy'; readColor = '#22c55e'; }
        else if (readability >= 60) { readLabel = 'Easy'; readColor = '#16a34a'; }
        else if (readability >= 40) { readLabel = 'Standard'; readColor = '#f59e0b'; }
        else if (readability >= 20) { readLabel = 'Difficult'; readColor = '#f97316'; }
        else { readLabel = 'Very Difficult'; readColor = '#ef4444'; }
    }

    // Top words (frequency)
    var topWords = getTopWords(text, 10);

    // Update display
    document.getElementById('rWords').textContent = words.toLocaleString();
    document.getElementById('rChars').textContent = chars.toLocaleString();
    document.getElementById('rCharsNoSpace').textContent = charsNoSpace.toLocaleString();
    document.getElementById('rSentences').textContent = sentences.toLocaleString();
    document.getElementById('rParagraphs').textContent = paragraphs.toLocaleString();
    document.getElementById('rLines').textContent = lines.toLocaleString();
    document.getElementById('rReadTime').textContent = readTime;
    document.getElementById('rSpeakTime').textContent = speakTime;
    document.getElementById('rAvgWord').textContent = avgWordLen + ' chars';
    document.getElementById('rAvgSent').textContent = avgSentLen + ' words';
    document.getElementById('rSyllables').textContent = syllables.toLocaleString();
    document.getElementById('rLongest').textContent = longestWord || '-';

    // Readability
    document.getElementById('rReadScore').textContent = readability;
    document.getElementById('rReadLabel').textContent = readLabel;
    document.getElementById('rReadScore').style.color = readColor;
    document.getElementById('rReadLabel').style.color = readColor;
    document.getElementById('readBar').style.width = readability + '%';
    document.getElementById('readBar').style.background = readColor;

    // Top words
    var topEl = document.getElementById('topWords');
    topEl.innerHTML = '';
    if (topWords.length === 0) {
        topEl.innerHTML = '<p style="color:var(--text-light);font-size:12px;text-align:center;">Start typing to see word frequency</p>';
    } else {
        var maxCount = topWords[0].count;
        for (var i = 0; i < topWords.length; i++) {
            var pct = Math.round((topWords[i].count / maxCount) * 100);
            var div = document.createElement('div');
            div.className = 'tw-item';
            div.innerHTML =
                '<div class="tw-rank">' + (i + 1) + '</div>' +
                '<div class="tw-info">' +
                    '<div class="tw-word">' + escH(topWords[i].word) + '</div>' +
                    '<div class="tw-bar-wrap"><div class="tw-bar" style="width:' + pct + '%;"></div></div>' +
                '</div>' +
                '<div class="tw-count">' + topWords[i].count + '</div>';
            topEl.appendChild(div);
        }
    }
}

// Count syllables (approximate English)
function countSyllables(text) {
    var words = text.trim().split(/\s+/);
    var total = 0;
    for (var i = 0; i < words.length; i++) {
        var word = words[i].toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 2) { total += 1; continue; }
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        var matches = word.match(/[aeiouy]{1,2}/g);
        total += matches ? matches.length : 1;
    }
    return total;
}

// Get top N most frequent words
function getTopWords(text, n) {
    var words = text.toLowerCase().replace(/[^a-zA-Z0-9\s\u0900-\u097F]/g, '').trim().split(/\s+/);
    var freq = {};
    var stopWords = {
        'the':1,'is':1,'at':1,'which':1,'on':1,'a':1,'an':1,'and':1,'or':1,'but':1,
        'in':1,'to':1,'for':1,'of':1,'with':1,'it':1,'this':1,'that':1,'was':1,'are':1,
        'be':1,'has':1,'had':1,'have':1,'will':1,'not':1,'no':1,'from':1,'by':1,'as':1,
        'i':1,'me':1,'my':1,'we':1,'he':1,'she':1,'they':1,'you':1,'your':1,'his':1,
        'her':1,'its':1,'our':1,'them':1,'do':1,'does':1,'did':1,'if':1,'so':1,'up':1
    };

    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.length < 2 || stopWords[w]) continue;
        freq[w] = (freq[w] || 0) + 1;
    }

    var sorted = [];
    for (var w in freq) {
        sorted.push({ word: w, count: freq[w] });
    }
    sorted.sort(function(a, b) { return b.count - a.count; });

    return sorted.slice(0, n);
}

// Clear text
function clearText() {
    document.getElementById('textInput').value = '';
    analyzeText();
}

// Copy stats
function copyStats() {
    var w = document.getElementById('rWords').textContent;
    var c = document.getElementById('rChars').textContent;
    var s = document.getElementById('rSentences').textContent;
    var p = document.getElementById('rParagraphs').textContent;
    var text = 'Words: ' + w + ' | Characters: ' + c + ' | Sentences: ' + s + ' | Paragraphs: ' + p;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() { alert('Stats copied!'); });
    } else { prompt('Copy:', text); }
}

// Paste from clipboard
function pasteText() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(text) {
            document.getElementById('textInput').value = text;
            analyzeText();
        });
    } else {
        document.getElementById('textInput').focus();
        alert('Press Ctrl+V to paste');
    }
}

// Sample text
function loadSample() {
    document.getElementById('textInput').value = 'The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate the word counter tool. It counts words, characters, sentences, and paragraphs in real-time as you type.\n\nYou can also paste your own text here to analyze it. The tool provides reading time, speaking time, readability score, and word frequency analysis.\n\nTry typing or pasting your own content to see detailed statistics about your text. This is useful for writers, students, bloggers, and anyone who needs to track word count for their documents.\n\nThe readability score is based on the Flesch-Kincaid formula, which analyzes sentence length and syllable count to determine how easy or difficult the text is to read.';
    analyzeText();
}

function escH(s) {
    return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

console.log('Word Counter loaded');