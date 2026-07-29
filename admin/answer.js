import { db } from "../firebase/config.js";
import { doc, getDoc, addDoc, collection, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get("id");

const studentName = document.getElementById("studentName");
const studentClass = document.getElementById("studentClass");
const studentSubject = document.getElementById("studentSubject");
const studentQuestion = document.getElementById("studentQuestion");
const answerTitle = document.getElementById("answerTitle");
const answerText = document.getElementById("answerText");
const publishBtn = document.getElementById("publishBtn");

async function loadQuestionDetails() {
  if (!questionId) {
    alert("No Question ID found!");
    return;
  }

  const docRef = doc(db, "questions", questionId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    studentName.innerText = data.name;
    studentClass.innerText = data.studentClass;
    studentSubject.innerText = data.subject;
    studentQuestion.innerText = data.question;
  } else {
    alert("Question does not exist!");
  }
}

publishBtn.addEventListener("click", async () => {
  const title = answerTitle.value.trim();
  const answer = answerText.value.trim();

  if (!title || !answer) {
    alert("Please fill in both title and answer!");
    return;
  }

  try {
    // 1. Save answer in 'answers' collection
    await addDoc(collection(db, "answers"), {
      questionId: questionId,
      title: title,
      answer: answer,
      status: "Published",
      createdAt: new Date().toISOString()
    });

    // 2. Update question status to Answered
    const qRef = doc(db, "questions", questionId);
    await updateDoc(qRef, {
      status: "Answered"
    });

    alert("Answer Published Successfully!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error publishing answer: ", error);
    alert("Failed to publish answer.");
  }
});

loadQuestionDetails();
