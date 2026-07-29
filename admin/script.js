import { getQuestions } from "../firebase/database.js";

const table = document.getElementById("questionsTable");

async function loadQuestions() {
  try {
    const questions = await getQuestions();
    table.innerHTML = "";
    
    if (questions.length === 0) {
      table.innerHTML = `<tr><td colspan="5">No Questions Found</td></tr>`;
      return;
    }

    questions.forEach((q) => {
      table.innerHTML += `
        <tr>
          <td>${q.name}</td>
          <td>${q.studentClass}</td>
          <td>${q.subject}</td>
          <td>${q.status}</td>
          <td><button>Answer</button></td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading questions:", error);
    table.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
  }
}

loadQuestions();
