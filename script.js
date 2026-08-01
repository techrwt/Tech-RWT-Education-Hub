// Firebase Config Setup
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
}

// Global flag to prevent double execution in the same session lifecycle
window._doubtSubmitting = false;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("doubtForm") || document.getElementById("ask-doubt-form") || document.querySelector("form");

  if (form && !form.hasAttribute("data-listener-attached")) {
    form.setAttribute("data-listener-attached", "true");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();

      if (window._doubtSubmitting) return;
      window._doubtSubmitting = true;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";
      }

      const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "Anonymous";
      const classVal = document.getElementById("studentClass") ? document.getElementById("studentClass").value.trim() : "N/A";
      const subjectVal = document.getElementById("subject") ? document.getElementById("subject").value.trim() : "General";
      const questionVal = document.getElementById("question") ? document.getElementById("question").value.trim() : "";

      if (!questionVal) {
        alert("Please enter your question!");
        window._doubtSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Submit Doubt";
        }
        return;
      }

      try {
        if (typeof firebase !== 'undefined' && firebase.apps.length) {
          const db = firebase.firestore();
          await db.collection("questions").add({
            studentName: nameVal,
            studentClass: classVal,
            subject: subjectVal,
            question: questionVal,
            answer: "",
            status: "unanswered",
            type: "doubt",
            published: false,
            createdAt: new Date().toISOString()
          });

          alert("🎉 AAPKA QUESTION SUCCESSFULLY SUBMIT HO GAYA HAI!");
          form.reset();
        } else {
          alert("Firebase initialization pending.");
        }
      } catch (err) {
        console.error("Error submitting doubt:", err);
        alert("Error submitting question: " + err.message);
      } finally {
        window._doubtSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Submit Doubt";
        }
      }
    }, { once: false });
  }
});
// Function to load filtered data for Class Pages (Notes, PYQ, Important PYQ)
async function loadClassData(selectedCategory) {
  const notesContainer = document.getElementById("notes-list");
  const pyqContainer = document.getElementById("pyq-list");
  const importantPyqContainer = document.getElementById("important-pyq-list");

  // 1. Fetch Notes
  if (notesContainer) {
    db.collection("notes")
      .where("category", "==", selectedCategory)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          notesContainer.innerHTML = "<p>No Notes available for this class.</p>";
          return;
        }
        let html = "";
        snapshot.forEach((doc) => {
          const data = doc.data();
          html += `<div class="card">
            <h3>${data.title || "Note"}</h3>
            <p>Subject: ${data.subject || "N/A"}</p>
            <a href="${data.link}" target="_blank" class="btn">View PDF</a>
          </div>`;
        });
        notesContainer.innerHTML = html;
      })
      .catch((err) => {
        notesContainer.innerHTML = "<p>Error loading notes.</p>";
      });
  }

  // 2. Fetch PYQs and Important PYQs
  if (pyqContainer || importantPyqContainer) {
    db.collection("pyqs")
      .where("category", "==", selectedCategory)
      .get()
      .then((snapshot) => {
        let pyqHtml = "";
        let importantPyqHtml = "";

        snapshot.forEach((doc) => {
          const data = doc.data();
          const cardHtml = `<div class="card">
            <h3>${data.title || "PYQ"}</h3>
            <p>Subject: ${data.subject || "N/A"}</p>
            <a href="${data.link}" target="_blank" class="btn">View PDF</a>
          </div>`;

          if (data.pyqType === "important-pyq") {
            importantPyqHtml += cardHtml;
          } else {
            pyqHtml += cardHtml;
          }
        });

        if (pyqContainer) {
          pyqContainer.innerHTML = pyqHtml || "<p>No PYQs available for this class.</p>";
        }
        if (importantPyqContainer) {
          importantPyqContainer.innerHTML = importantPyqHtml || "<p>No Important PYQs available for this class.</p>";
        }
      })
      .catch((err) => {
        if (pyqContainer) pyqContainer.innerHTML = "<p>Error loading PYQs.</p>";
        if (importantPyqContainer) importantPyqContainer.innerHTML = "<p>Error loading Important PYQs.</p>";
      });
  }
}
