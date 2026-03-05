// ====================================
// EduNote AI - Final Clean Version
// ====================================

// --------------------
// State
// --------------------
const state = {
  currentTab: 'text',
  generatedSummary: null,
  generatedKeywords: []
};

// --------------------
// DOM Elements
// --------------------
const elements = {
  tabs: document.querySelectorAll('.tab-button'),
  tabContents: document.querySelectorAll('.tab-content'),
  generateBtn: document.getElementById('generate-btn'),
  btnText: document.getElementById('btn-text'),
  btnSpinner: document.getElementById('btn-spinner'),
  textInput: document.getElementById('text-input'),
  pdfInput: document.getElementById('pdf-input'),
  pdfFileName: document.getElementById('pdf-file-name'),
  youtubeInput: document.getElementById('youtube-input'),
  resultsSection: document.getElementById('results-section'),
  summaryContent: document.getElementById('summary-content'),
  keywordsContainer: document.getElementById('keywords-container'),
  downloadPdfBtn: document.getElementById('download-pdf-btn'),
  downloadDocxBtn: document.getElementById('download-docx-btn'),
  alertContainer: document.getElementById('alert-container')
};

// --------------------
// Tab Switching
// --------------------
function switchTab(tabName) {
  state.currentTab = tabName;

  elements.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  elements.tabContents.forEach(content => {
    content.classList.toggle('active', content.dataset.content === tabName);
  });

  clearAlerts();
}

elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// --------------------
// Alerts
// --------------------
function showAlert(message, type = 'success') {
  elements.alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      ${type === 'success' ? '✅' : '❌'} ${message}
    </div>
  `;
}

function clearAlerts() {
  elements.alertContainer.innerHTML = '';
}

// --------------------
// Validation
// --------------------
function validateInput() {
  clearAlerts();

  if (state.currentTab === 'text') {
    const text = elements.textInput.value.trim();
    if (text.length < 50) {
      showAlert('Please enter at least 50 characters.', 'error');
      return false;
    }
  }

  if (state.currentTab === 'pdf') {
    if (!elements.pdfInput.files[0]) {
      showAlert('Please upload a file.', 'error');
      return false;
    }
  }

  if (state.currentTab === 'youtube') {
    const url = elements.youtubeInput.value.trim();
    if (!url) {
      showAlert('Please enter a YouTube URL.', 'error');
      return false;
    }
  }

  return true;
}

// --------------------
// Generate Notes (Backend)
// --------------------
async function generateNotes() {
  if (!validateInput()) return;

  elements.generateBtn.disabled = true;
  elements.btnText.textContent = "Processing...";
  elements.btnSpinner.classList.remove('hidden');
  elements.resultsSection.classList.remove('active');

  try {
    const formData = new FormData();
    formData.append('type', state.currentTab);

    if (state.currentTab === 'text') {
      formData.append('text', elements.textInput.value);
    } else if (state.currentTab === 'pdf') {
      formData.append('file', elements.pdfInput.files[0]);
    } else if (state.currentTab === 'youtube') {
      formData.append('url', elements.youtubeInput.value);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    state.generatedSummary = data.summary;
    state.generatedKeywords = data.keywords;

    displayResults();
    showAlert("Notes generated successfully!", "success");

  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    elements.generateBtn.disabled = false;
    elements.btnText.textContent = "Generate Notes";
    elements.btnSpinner.classList.add('hidden');
  }
}

// --------------------
// Display Results
// --------------------
function displayResults() {
  elements.summaryContent.textContent = state.generatedSummary;

  elements.keywordsContainer.innerHTML = '';
  state.generatedKeywords.forEach(keyword => {
    const tag = document.createElement('span');
    tag.className = 'keyword-tag';
    tag.textContent = keyword;
    elements.keywordsContainer.appendChild(tag);
  });

  elements.resultsSection.classList.add('active');
}

// --------------------
// Download PDF (From Backend)
// --------------------
async function downloadPDF() {
  if (!state.generatedSummary) {
    showAlert("Generate notes first.", "error");
    return;
  }

  const response = await fetch('/download/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: state.generatedSummary,
      keywords: state.generatedKeywords
    })
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "EduNote-Summary.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

// --------------------
// Download DOCX (From Backend)
// --------------------
async function downloadDOCX() {
  if (!state.generatedSummary) {
    showAlert("Generate notes first.", "error");
    return;
  }

  const response = await fetch('/download/docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: state.generatedSummary,
      keywords: state.generatedKeywords
    })
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "EduNote-Summary.docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

// --------------------
// Event Listeners
// --------------------
elements.generateBtn.addEventListener('click', generateNotes);
elements.downloadPdfBtn.addEventListener('click', downloadPDF);
elements.downloadDocxBtn.addEventListener('click', downloadDOCX);

console.log("EduNote AI Ready 🚀");