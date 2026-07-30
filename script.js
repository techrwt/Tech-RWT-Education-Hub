// Student Doubt Form Submission Logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("doubtForm") || document.getElementById("ask-doubt-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const nameEl = document.getElementById("name");
      const classEl = document.getElementById("studentClass");
      const subjectEl = document.getElementById("subject");
      const questionEl = document.getElementById("question");

      const data = {
        studentName: nameEl ? nameEl.value.trim() : "Anonymous",
        studentClass: classEl ? classEl.value.trim() : "N/A",
        subject: subjectEl ? subjectEl.value.trim() : "General",
        question: questionEl ? questionEl.value.trim() : "",
        createdAt: new Date().toISOString(),
        status: "unanswered",
        type: "doubt",
        published: false
      };

      if (!data.question) {
        alert("Please enter your question!");
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      try {
        // Direct Firebase Firestore Compat Check
        if (typeof firebase !== 'undefined' && firebase.apps.length) {
          const db = firebase.firestore();
          await db.collection("questions").add(data);
          alert("🎉 AAPKA QUESTION SUCCESSFULLY SUBMIT HO GAYA HAI!");
          form.reset();
        } else {
          // Fallback module call
          const { saveQuestion } = await import("./firebase/database.js");
          await saveQuestion(data);
          alert("🎉 AAPKA QUESTION SUCCESSFULLY SUBMIT HO GAYA HAI!");
          form.reset();
        }
      } catch (err) {
        console.error("Error submitting doubt:", err);
        alert("Error submitting question: " + err.message);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
