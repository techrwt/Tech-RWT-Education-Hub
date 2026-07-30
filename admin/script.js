// Global Functions for Inline Onclick Handlers
window.switchSection = function(sectionName) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.classList.remove('active-section'));

  const menuItems = document.querySelectorAll('.sidebar ul li');
  menuItems.forEach(item => item.classList.remove('active'));

  const targetSection = document.getElementById(`section-${sectionName}`);
  if (targetSection) targetSection.classList.add('active-section');

  const targetMenu = document.getElementById(`menu-${sectionName}`);
  if (targetMenu) targetMenu.classList.add('active');
};

let editingAnswerId = null;

window.toggleAddForm = function(isEdit = false) {
  const box = document.getElementById('add-answer-form-box');
  if (box) {
    if (!isEdit && box.style.display !== 'none') {
      // Reset if closing or opening fresh
      document.getElementById('publish-answer-form').reset();
      editingAnswerId = null;
    }
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
  }
};

window.toggleNotesForm = function() {
  const box = document.getElementById('add-note-form-box');
  if (box) box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
};

window.togglePyqForm = function() {
  const box = document.getElementById('add-pyq-form-box');
  if (box) box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
};

window.logout = function() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};

// Initialize App
let db;

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyD3S1wg31KRNbFPm483H-JZH1aFSUV4Org",
    authDomain: "tech-rwt-education-hub.firebaseapp.com",
    projectId: "tech-rwt-education-hub",
    storageBucket: "tech-rwt-education-hub.firebasestorage.app",
    messagingSenderId: "883411092191",
    appId: "1:883411092191:web:8d6d96b29034cecf119f6a"
  };

  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } else if (typeof firebase !== 'undefined') {
    db = firebase.firestore();
  }
}

// Dynamically Load Firebase SDK
(function loadFirebase() {
  const script1 = document.createElement('script');
  script1.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
  script1.onload = () => {
    const script2 = document.createElement('script');
    script2.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
    script2.onload = () => {
      initFirebase();
      setupFormListeners();
      loadAdminPublishedAnswers();
      loadStudentQuestions();
      loadDashboardStats();
    };
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);
})();

// Real-Time Dashboard Overview Numbers
async function loadDashboardStats() {
  if (!db) return;

  try {
    const qSnapshot = await db.collection('questions').get();
    let publishedCount = 0;
    let studentQCount = 0;
    let unansweredCount = 0;

    qSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'article' || data.published === true) {
        publishedCount++;
      } else {
        studentQCount++;
        if (data.status !== 'answered') {
          unansweredCount++;
        }
      }
    });

    const elPublished = document.getElementById('stat-published-answers');
    const elStudentQ = document.getElementById('stat-student-questions');
    const elUnanswered = document.getElementById('stat-unanswered');

    if (elPublished) elPublished.innerText = publishedCount;
    if (elStudentQ) elStudentQ.childNodes[0].nodeValue = studentQCount + " ";
    if (elUnanswered) elUnanswered.innerText = unansweredCount;

    const notesSnapshot = await db.collection('notes').get();
    const elNotes = document.getElementById('stat-notes');
    if (elNotes) elNotes.innerText = notesSnapshot.size;

    const pyqSnapshot = await db.collection('pyqs').get();
    const elPyqs = document.getElementById('stat-pyqs');
    if (elPyqs) elPyqs.innerText = pyqSnapshot.size;

  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }
}

// Load Published Answers with Edit & Delete Options
async function loadAdminPublishedAnswers() {
  const container = document.getElementById('admin-answers-list');
  if (!container || !db) return;

  try {
    const snapshot = await db.collection('questions').get();
    container.innerHTML = '';

    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;

      if (data.type === 'article' || data.published === true) {
        count++;
        const card = document.createElement('div');
        card.style.cssText = 'background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #4e73df; position: relative;';
        
        card.innerHTML = `
          <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">
            <strong>${data.subject || 'General'}</strong> | ${data.category || 'All'}
          </div>
          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${data.question}</h3>
          <p style="font-size: 14px; color: #475569; max-height: 80px; overflow: hidden; text-overflow: ellipsis; margin-bottom: 12px;">${data.answer}</p>
          <div style="display: flex; gap: 10px;">
            <button onclick="editAnswer('${docId}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">✏️ Edit</button>
            <button onclick="deleteAnswer('${docId}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">🗑️ Delete</button>
          </div>
        `;
        container.appendChild(card);
      }
    });

    if (count === 0) {
      container.innerHTML = '<p style="color: #64748b;">No published answers found.</p>';
    }

  } catch (err) {
    console.error("Error loading answers:", err);
  }
}

// Edit Answer Function
window.editAnswer = async function(id) {
  try {
    const doc = await db.collection('questions').doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('ans-title').value = data.question || '';
      document.getElementById('ans-subject').value = data.subject || '';
      document.getElementById('ans-category').value = data.category || '';
      document.getElementById('ans-body').value = data.answer || '';
      
      editingAnswerId = id;
      
      const formBox = document.getElementById('add-answer-form-box');
      if (formBox) {
        formBox.style.display = 'block';
        formBox.scrollIntoView({ behavior: 'smooth' });
      }
    }
  } catch (err) {
    alert("Error fetching answer details: " + err.message);
  }
};

// Delete Answer Function
window.deleteAnswer = async function(id) {
  if (confirm("Kya aap sach me is answer ko delete karna chahte hain?")) {
    try {
      await db.collection('questions').doc(id).delete();
      alert("✅ Answer deleted successfully!");
      loadAdminPublishedAnswers();
      loadDashboardStats();
    } catch (err) {
      alert("Error deleting answer: " + err.message);
    }
  }
};

// Load Student Questions
async function loadStudentQuestions() {
  const container = document.getElementById('student-questions-list');
  if (!container || !db) return;

  try {
    const snapshot = await db.collection('questions').get();
    container.innerHTML = '';

    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type !== 'article' && data.published !== true) {
        count++;
        const isAnswered = data.status === 'answered';
        const card = document.createElement('div');
        card.style.cssText = `background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid ${isAnswered ? '#10b981' : '#f59e0b'};`;
        card.innerHTML = `
          <div style="font-size: 12px; color: #64748b; margin-bottom: 5px; display: flex; justify-content: space-between;">
            <span><strong>${data.subject || 'General'}</strong> | Student Doubt</span>
            <span style="font-weight: bold; color: ${isAnswered ? '#10b981' : '#f59e0b'};">${isAnswered ? '✅ Answered' : '⏳ Unanswered'}</span>
          </div>
          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${data.question}</h3>
        `;
        container.appendChild(card);
      }
    });

    if (count === 0) {
      container.innerHTML = '<p style="color: #64748b;">No new questions submitted by students yet.</p>';
    }

  } catch (err) {
    console.error("Error loading student questions:", err);
  }
}

function setupFormListeners() {
  // Answers Form (Publish or Update)
  const publishForm = document.getElementById('publish-answer-form');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        question: document.getElementById('ans-title').value.trim(),
        subject: document.getElementById('ans-subject').value.trim(),
        category: document.getElementById('ans-category').value.trim(),
        answer: document.getElementById('ans-body').value.trim(),
        type: 'article',
        status: 'answered',
        published: true,
        updatedAt: new Date().toISOString()
      };

      try {
        if (editingAnswerId) {
          // Update existing doc
          await db.collection('questions').doc(editingAnswerId).update(payload);
          alert('🚀 Answer updated successfully!');
          editingAnswerId = null;
        } else {
          // Add new doc
          payload.createdAt = new Date().toISOString();
          await db.collection('questions').add(payload);
          alert('🚀 Answer published successfully!');
        }

        publishForm.reset();
        window.toggleAddForm();
        loadAdminPublishedAnswers();
        loadDashboardStats();
      } catch (err) { alert('Error saving answer: ' + err.message); }
    });
  }

  // Notes Form
  const noteForm = document.getElementById('publish-note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await db.collection('notes').add({
          title: document.getElementById('note-title').value.trim(),
          category: document.getElementById('note-category').value,
          subject: document.getElementById('note-subject').value.trim(),
          link: document.getElementById('note-link').value.trim(),
          description: document.getElementById('note-desc').value.trim(),
          type: 'note',
          createdAt: new Date().toISOString()
        });
        alert('🚀 Note published successfully!');
        noteForm.reset();
        window.toggleNotesForm();
        loadDashboardStats();
      } catch (err) { alert('Error publishing note: ' + err.message); }
    });
  }

  // PYQ Form
  const pyqForm = document.getElementById('publish-pyq-form');
  if (pyqForm) {
    pyqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await db.collection('pyqs').add({
          title: document.getElementById('pyq-title').value.trim(),
          category: document.getElementById('pyq-category').value,
          subject: document.getElementById('pyq-subject').value.trim(),
          link: document.getElementById('pyq-link').value.trim(),
          type: 'pyq',
          createdAt: new Date().toISOString()
        });
        alert('🚀 PYQ published successfully!');
        pyqForm.reset();
        window.togglePyqForm();
        loadDashboardStats();
      } catch (err) { alert('Error publishing PYQ: ' + err.message); }
    });
  }
}
