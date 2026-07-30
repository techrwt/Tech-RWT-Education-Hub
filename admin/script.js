// Tab Switcher
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

// Form Toggles
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

// Logout
window.logout = function() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};

// Firebase Dynamic Loader
(function loadFirebase() {
  const script1 = document.createElement('script');
  script1.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
  script1.onload = () => {
    const script2 = document.createElement('script');
    script2.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
    script2.onload = initApp;
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);
})();

let db;

function initApp() {
  const firebaseConfig = {
    apiKey: "AIzaSyD3S1wg31KRNbFPm483H-JZH1aFSUV4Org",
    authDomain: "tech-rwt-education-hub.firebaseapp.com",
    projectId: "tech-rwt-education-hub",
    storageBucket: "tech-rwt-education-hub.firebasestorage.app",
    messagingSenderId: "883411092191",
    appId: "1:883411092191:web:8d6d96b29034cecf119f6a"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

// Form Handlers
document.addEventListener('DOMContentLoaded', () => {

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
      } catch (err) { alert('Error: ' + err.message); }
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
      } catch (err) { alert('Error: ' + err.message); }
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
      } catch (err) { alert('Error: ' + err.message); }
    });
  }

});
