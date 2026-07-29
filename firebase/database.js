import { db } from "./config.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

async function saveQuestion(data){

try{

await addDoc(collection(db,"questions"),data);

alert("Question Submitted Successfully!");

}catch(error){

console.error(error);

alert("Error submitting question.");

}

}

export { saveQuestion };
