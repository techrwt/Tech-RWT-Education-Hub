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

window.toggleAddForm = function() {
  const box = document.getElementById('add-answer-form-box');
  if (box) box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
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

// Dynamically Load Firebase Compat SDK
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
    };
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);
})();

// Load Published Answers ONLY in Answers/CMS section
async function loadAdminPublishedAnswers() {
  const container = document.getElementById('admin-answers-list');
  if (!container || !db) return;

  try {
    const snapshot = await db.collection('questions').get();
    container.innerHTML = '';

    let count = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'article' || data.published === true) {
        count++;
        const card = document.createElement('div');
        card.style.cssText = 'background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #4e73df;';
        card.innerHTML = `
          <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">
            <strong>${data.subject || 'General'}</strong> | ${data.category || 'All'}
          </div>
          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${data.question}</h3>
          <p style="font-size: 14px; color: #475569; max-height: 80px; overflow: hidden; text-overflow: ellipsis;">${data.answer}</p>
        `;
        container.appendChild(card);
      }
    });

    if (count === 0) {
      container.innerHTML = '<p style="color: #64748b;">No published answers found.</p>';
    }

  } catch (err) {
    console.error("Error loading answers:", err);
    container.innerHTML = '<p style="color: red;">Failed to load published items: ' + err.message + '</p>';
  }
}

function setupFormListeners() {
  // 1. ANSWERS FORM
  const publishForm = document.getElementById('publish-answer-form');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await db.collection('questions').add({
          question: document.getElementById('ans-title').value.trim(),
          subject: document.getElementById('ans-subject').value.trim(),
          category: document.getElementById('ans-category').value.trim(),
          answer: document.getElementById('ans-body').value.trim(),
          type: 'article',
          status: 'answered',
          published: true,
          createdAt: new Date().toISOString()
        });
        alert('🚀 Answer published successfully!');
        publishForm.reset();
        window.toggleAddForm();
        loadAdminPublishedAnswers();
      } catch (err) { alert('Error publishing answer: ' + err.message); }
    });
  }

  // 2. NOTES FORM
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
      } catch (err) { alert('Error publishing note: ' + err.message); }
    });
  }

  // 3. PYQ FORM
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
      } catch (err) { alert('Error publishing PYQ: ' + err.message); }
    });
  }
}
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

// Dynamically Load Firebase Compat SDK
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
    };
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);
})();

// Load Published Answers in Admin Panel
async function loadAdminPublishedAnswers() {
  const container = document.getElementById('admin-answers-list');
  if (!container || !db) return;

  try {
    const snapshot = await db.collection('questions').where('type', '==', 'article').get();
    container.innerHTML = '';

    if (snapshot.empty) {
      container.innerHTML = '<p style="color: #64748b;">No published answers found.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.style.cssText = 'background: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #4e73df;';
      card.innerHTML = `
        <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">
          <strong>${data.subject || 'General'}</strong> | ${data.category || 'All'}
        </div>
        <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">${data.question}</h3>
        <p style="font-size: 14px; color: #475569; max-height: 80px; overflow: hidden; text-overflow: ellipsis;">${data.answer}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading answers:", err);
    container.innerHTML = '<p style="color: red;">Failed to load published items.</p>';
  }
}

function setupFormListeners() {
  // 1. ANSWERS FORM
  const publishForm = document.getElementById('publish-answer-form');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await db.collection('questions').add({
          question: document.getElementById('ans-title').value.trim(),
          subject: document.getElementById('ans-subject').value.trim(),
          category: document.getElementById('ans-category').value.trim(),
          answer: document.getElementById('ans-body').value.trim(),
          type: 'article',
          status: 'answered',
          published: true,
          createdAt: new Date().toISOString()
        });
        alert('🚀 Answer published successfully!');
        publishForm.reset();
        window.toggleAddForm();
        loadAdminPublishedAnswers();
      } catch (err) { alert('Error publishing answer: ' + err.message); }
    });
  }

  // 2. NOTES FORM
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
      } catch (err) { alert('Error publishing note: ' + err.message); }
    });
  }

  // 3. PYQ FORM
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
      } catch (err) { alert('Error publishing PYQ: ' + err.message); }
    });
  }
}
