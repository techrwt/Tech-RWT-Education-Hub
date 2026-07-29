import { db } from "./config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function saveQuestion(data) {
  try {
    await addDoc(collection(db, "questions"), data);
    alert("Question Submitted Successfully!");
  } catch (error) {
    console.error(error);
    alert("Error submitting question.");
  }
}

async function getQuestions() {
  const snapshot = await getDocs(collection(db, "questions"));
  const questions = [];
  snapshot.forEach((doc) => {
    questions.path({
      id: doc.id,
      ...doc.data()
    });
  });
  return questions;
}

export { db, saveQuestion, getQuestions };
