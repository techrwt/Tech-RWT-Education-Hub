const form = document.getElementById("loginForm");
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "techrwt" && password === "123456") {
            localStorage.setItem("adminLoggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("error").textContent = "Invalid Username or Password";
        }
    });
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tera Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "tech-rwt-education-hub",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// Page load hone par questions fetch honge
document.addEventListener("DOMContentLoaded", loadQuestions);
window.logout = function () {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
}
