// ==========================================
// MERGE PDF - PAGE JAVASCRIPT
// ==========================================

let uploadedFiles = [];

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// ========== DRAG & DROP ==========
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

if (uploadArea) {
    // Drag events
    ['dragenter', 'dragover'].forEach(event => {
        uploadArea.addEventListener(event, (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        uploadArea.addEventListener(event, (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
    });

    // Drop files
    uploadArea.addEventListener('drop', (e) => {
        const files = [...e.dataTransfer.files].filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            addFiles(files);
        } else {
            alert('Please drop PDF files only!');
        }
    });

    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            fileInput.click();
        }
    });
}

// File input change
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = [...e.target.files];
        addFiles(files);
        fileInput.value = ''; // Reset input
    });
}

// ========== ADD FILES ==========
function addFiles(files) {
    files.forEach(file => {
        if (file.type === 'application/pdf') {
            uploadedFiles.push({
                id: Date.now() + Math.random(),
                file: file,
                name: file.name,
                size: file.size
            });
        }
    });

    if (uploadedFiles.length > 0) {
        showFileList();
    }
}

// ========== SHOW FILE LIST ==========
function showFileList() {
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileListArea').style.display = 'block';
    document.getElementById('fileCount').textContent = uploadedFiles.length;

    renderFileList();
}

// ========== RENDER FILE LIST ==========
function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    uploadedFiles.forEach((fileObj, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.draggable = true;
        fileItem.dataset.index = index;

        fileItem.innerHTML = `
            <div class="file-drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="file-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="file-info">
                <h4>${fileObj.name}</h4>
                <span>${formatFileSize(fileObj.size)}</span>
            </div>
            <div class="file-order-btns">
                <button onclick="moveFile(${index}, -1)" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-up"></i>
                </button>
                <button onclick="moveFile(${index}, 1)" ${index === uploadedFiles.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Drag events for reorder
        fileItem.addEventListener('dragstart', handleDragStart);
        fileItem.addEventListener('dragover', handleDragOver);
        fileItem.addEventListener('drop', handleDrop);
        fileItem.addEventListener('dragend', handleDragEnd);

        fileList.appendChild(fileItem);
    });

    document.getElementById('fileCount').textContent = uploadedFiles.length;

    // Disable merge button if less than 2 files
    const mergeBtn = document.getElementById('mergeBtn');
    if (uploadedFiles.length < 2) {
        mergeBtn.style.opacity = '0.5';
        mergeBtn.style.pointerEvents = 'none';
    } else {
        mergeBtn.style.opacity = '1';
        mergeBtn.style.pointerEvents = 'auto';
    }
}

// ========== DRAG REORDER ==========
let dragIndex = null;

function handleDragStart(e) {
    dragIndex = parseInt(e.target.closest('.file-item').dataset.index);
    e.target.closest('.file-item').classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const dropIndex = parseInt(e.target.closest('.file-item').dataset.index);
    
    if (dragIndex !== null && dragIndex !== dropIndex) {
        const [movedItem] = uploadedFiles.splice(dragIndex, 1);
        uploadedFiles.splice(dropIndex, 0, movedItem);
        renderFileList();
    }
}

function handleDragEnd(e) {
    e.target.closest('.file-item')?.classList.remove('dragging');
    dragIndex = null;
}

// ========== MOVE FILE ==========
function moveFile(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= uploadedFiles.length) return;

    const [item] = uploadedFiles.splice(index, 1);
    uploadedFiles.splice(newIndex, 0, item);
    renderFileList();
}

// ========== REMOVE FILE ==========
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    
    if (uploadedFiles.length === 0) {
        document.getElementById('uploadArea').style.display = 'flex';
        document.getElementById('fileListArea').style.display = 'none';
    } else {
        renderFileList();
    }
}

// ========== CLEAR ALL ==========
function clearAllFiles() {
    uploadedFiles = [];
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('fileListArea').style.display = 'none';
}

// ========== MERGE PDFs ==========
function mergePDFs() {
    if (uploadedFiles.length < 2) {
        alert('Please add at least 2 PDF files to merge!');
        return;
    }

    // Show processing
    document.getElementById('fileListArea').style.display = 'none';
    document.getElementById('processingArea').style.display = 'block';

    // Simulate progress
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                showDownload();
            }, 500);
        }
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
    }, 200);
}

// ========== SHOW DOWNLOAD ==========
function showDownload() {
    document.getElementById('processingArea').style.display = 'none';
    document.getElementById('downloadArea').style.display = 'block';

    // Calculate total size
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    document.getElementById('outputFileSize').textContent = formatFileSize(totalSize);
    document.getElementById('outputPages').textContent = uploadedFiles.length + ' Files Merged';
}

// ========== DOWNLOAD FILE ==========
function downloadFile() {
    // In production, this would download the actual merged file
    // For demo, we'll show an alert
    alert('📥 Download started!\n\nNote: In production, this will use PDF-lib.js or a backend API to actually merge and download the PDF.');
    
    // Example with actual implementation:
    // window.location.href = '/api/download/merged-file.pdf';
}

// ========== RESET TOOL ==========
function resetTool() {
    uploadedFiles = [];
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('fileListArea').style.display = 'none';
    document.getElementById('processingArea').style.display = 'none';
    document.getElementById('downloadArea').style.display = 'none';
}

// ========== FAQ TOGGLE ==========
function toggleFaq(element) {
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
        }
    });
    
    element.classList.toggle('active');
}

// ========== UTILITY FUNCTIONS ==========
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll(
        '.related-card, .how-to-step, .faq-item, .section-header'
    );
    
    elements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = `all 0.5s ease ${i * 0.05}s`;
        scrollObserver.observe(el);
    });
});

// ========== NAVBAR SCROLL ==========
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.pageYOffset > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        navbar.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.25)';
    }
});

console.log('🔥 Merge PDF Tool - Loaded Successfully!');