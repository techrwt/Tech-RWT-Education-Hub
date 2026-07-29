import { saveQuestion } from "./firebase/database.js";

const form = document.getElementById("doubtForm");

if (form) {

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      studentClass: document.getElementById("studentClass").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      question: document.getElementById("question").value.trim(),
      createdAt: new Date().toISOString(),
      status: "Pending"
    };

    if (
      !data.name ||
      !data.studentClass ||
      !data.subject ||
      !data.question
    ) {
      alert("Please fill all fields.");
      return;
    }

    await saveQuestion(data);

    form.reset();
  });

}
