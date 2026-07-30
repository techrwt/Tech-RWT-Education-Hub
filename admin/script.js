import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3S1wg31KRNbFPm483H-JZH1aFSUV4Org",
  authDomain: "tech-rwt-education-hub.firebaseapp.com",
  projectId: "tech-rwt-education-hub",
  storageBucket: "tech-rwt-education-hub.firebasestorage.app",
  messagingSenderId: "883411092191",
  appId: "1:883411092191:web:8d6d96b29034cecf119f6a",
  measurementId: "G-B5DP95WY9C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------------------------------------------------
// 1. Handle Admin Login
// -------------------------------------------------------------
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "techrwt" && password === "123456") {
      localStorage.setItem("adminLoggedIn", "true");
      window.location.href = "dashboard.html";
    } else {
      const errorDiv = document.getElementById("error");
      if (errorDiv) {
        errorDiv.textContent = "Invalid Username or Password";
        errorDiv.style.color = "red";
      }
    }
  });
}

// -------------------------------------------------------------
// 2. Handle Logout
// -------------------------------------------------------------
window.logout = function () {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};

// -------------------------------------------------------------
// 3. Navigation Switcher for Sidebar Tabs
// -------------------------------------------------------------
window.switchSection = function(sectionName) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.style.display = 'none');

  const menuItems = document.querySelectorAll('.sidebar ul li');
  menuItems.forEach(item => item.classList.remove('active'));

  const activeSection = document.getElementById(`section-${sectionName}`);
  if (activeSection) {
    activeSection.style.display = 'block';
  }

  const activeMenu = document.getElementById(`menu-${sectionName}`);
  if (activeMenu) {
    activeMenu.classList.add('active');
  }
};

// -------------------------------------------------------------
// 4. Toggle Add Answer Form Visibility
// -------------------------------------------------------------
window.toggleAddForm = function() {
  const formBox = document.getElementById('add-answer-form-box');
  if (formBox) {
    formBox.style.display = (formBox.style.display === 'none' || formBox.style.display === '') ? 'block' : 'none';
  }
};

// -------------------------------------------------------------
// 5. Handle Add New Answer Form Submission
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const publishForm = document.getElementById('publish-answer-form');
  
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('ans-title').value.trim();
      const subject = document.getElementById('ans-subject').value.trim();
      const category = document.getElementById('ans-category').value.trim();
      const answerBody = document.getElementById('ans-body').value.trim();

      if (!title || !subject || !category || !answerBody) {
        alert('Please fill in all required fields.');
        return;
      }

      const newArticleData = {
        question: title,
        subject: subject,
        category: category,
        answer: answerBody,
        type: 'article',
        status: 'answered',
        published: true,
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'questions'), newArticleData);
        alert('🚀 Answer published successfully!');
        publishForm.reset();
        window.toggleAddForm();
      } catch (error) {
        console.error('Error publishing answer:', error);
        alert('Failed to publish answer: ' + error.message);
      }
    });
  }
});
