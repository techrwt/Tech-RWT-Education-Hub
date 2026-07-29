import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Handle Admin Login
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Set your admin username & password here
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

// Handle Logout
window.logout = function () {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};

// Load Questions in Admin Dashboard
async function loadQuestions() {
  const tableBody = document.getElementById("questionsTable");
  if (!tableBody) return;

  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    tableBody.innerHTML = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No questions found</td></tr>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const q = doc.data();
      const row = `
        <tr>
          <td>${q.name || "N/A"}</td>
          <td>${q.studentClass || "N/A"}</td>
          <td>${q.subject || "N/A"}</td>
          <td><span class="badge ${q.status ? q.status.toLowerCase() : 'pending'}">${q.status || "Pending"}</span></td>
          <td><a href="answer.html?id=${doc.id}" class="action-btn">Answer</a></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading questions: ", error);
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error loading data</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadQuestions);
