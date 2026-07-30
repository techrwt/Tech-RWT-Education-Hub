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

// Real-Time Dashboard Overview Numbers (Exact & Correct Separation)
async function loadDashboardStats() {
  if (!db) return;

  try {
    const qSnapshot = await db.collection('questions').get();
    let publishedCount = 0;
    let studentQCount = 0;
    let unansweredCount = 0;

    qSnapshot.forEach(doc => {
      const data = doc.data();
     const hasAnswer = data.answer && data.answer.trim() !== '';

      if (data.type === 'article') {
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

// Load ONLY Published Answers (No Student Doubts Mix)
function loadAdminPublishedAnswers() {
  const container = document.getElementById('admin-answers-list');
  if (!container || !db) return;

  db.collection('questions').onSnapshot((snapshot) => {
    container.innerHTML = '';
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      const hasAnswer = data.answer && data.answer.trim() !== '';

      if (data.type === 'article') {
        count++;
        const card = document.createElement('div');
        card.style.cssText = 'background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #4e73df; position: relative;';
        
        card.innerHTML = `
          <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">
            <strong>${data.subject || 'General'}</strong> | ${data.category || 'All'}
          </div>
          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${data.question || ''}</h3>
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
    loadDashboardStats();
  }, (err) => {
    console.error("Error loading published answers:", err);
  });
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
      loadDashboardStats();
    } catch (err) {
      alert("Error deleting answer: " + err.message);
    }
  }
};

// Load ONLY Pending Student Doubts
function loadStudentQuestions() {
  const container = document.getElementById('student-questions-list');
  if (!container || !db) return;

  db.collection('questions').onSnapshot((snapshot) => {
    container.innerHTML = '';
    let count = 0;

    snapshot.forEach(doc => {
            const data = doc.data();
            const docId = doc.id;
            if (data.type === 'student') {
                count++;
                const isAnswered = data.status === 'answered';
                const borderColor = isAnswered ? '#10b981' : '#f59e0b';
                const badgeText = isAnswered ? '✅ Answered' : '⏳ Pending Doubt';
                const badgeColor = isAnswered ? '#10b981' : '#f59e0b';

                const card = document.createElement('div');
                card.style.cssText = `background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0; border-left: 4px solid ${borderColor};`;
                
                let actionArea = '';
                if (!isAnswered) {
                    actionArea = `
                        <div style="margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
                            <textarea id="reply-text-${docId}" placeholder="Yahan apna answer likhein..." style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; margin-bottom: 6px; resize: vertical; box-sizing: border-box;"></textarea>
                            <button onclick="submitStudentAnswer('${docId}')" style="background: #10b981; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">🚀 Send Answer & Publish</button>
                        </div>
                    `;
                } else {
                    actionArea = `
                        <div style="margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 14px; color: #334155;">
                            <strong>Saved Answer:</strong>
                            <p style="margin: 5px 0 8px 0; background: #f8fafc; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;">${data.answer || ''}</p>
                            <button onclick="editAnswer('${docId}')" style="background: #f59e0b; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">✏ Edit Answer</button>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 5px; display: flex; justify-content: space-between;">
                        <span><strong>${data.subject || 'General'}</strong> | Student: ${data.studentName || 'Student'} (${data.studentClass || 'N/A'})</span>
                        <span style="font-weight: bold; color: ${badgeColor};">${badgeText}</span>
                    </div>
                    <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">${data.question || ''}</h3>
                    ${actionArea}
                `;
                container.appendChild(card);
            }
        });
    if (count === 0) {
      container.innerHTML = '<p style="color: #64748b;">No new questions submitted by students yet.</p>';
    }
    loadDashboardStats();
  }, (err) => {
    console.error("Error loading student questions:", err);
  });
}

// Submit Answer for Student Doubt Function (Fixed)
window.submitStudentAnswer = async function(docId) {
  const replyInput = document.getElementById(`reply-text-${docId}`);
  if (!replyInput) return;

  const answerText = replyInput.value.trim();
  if (!answerText) {
    alert("Kripya answer box me kuch likhein!");
    return;
  }

  try {
    await db.collection('questions').doc(docId).update({
      answer: answerText,
      status: "answered",
      published: true,
      type: "student",
      answeredAt: new Date().toISOString()
    });

    alert("✅ Answer successfully send ho gaya aur publish ho gaya!");
    loadDashboardStats();
  } catch (err) {
    console.error("Error updating answer:", err);
    alert("Error: " + err.message);
  }
};

// Form Listeners for Answer, Notes, PYQ Forms
function setupFormListeners() {
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
          await db.collection('questions').doc(editingAnswerId).update(payload);
          alert('🚀 Answer updated successfully!');
          editingAnswerId = null;
        } else {
          payload.createdAt = new Date().toISOString();
          await db.collection('questions').add(payload);
          alert('🚀 Answer published successfully!');
        }

        publishForm.reset();
        window.toggleAddForm();
        loadDashboardStats();
      } catch (err) { alert('Error saving answer: ' + err.message); }
    });
  }

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
