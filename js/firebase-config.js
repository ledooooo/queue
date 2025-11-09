// ===== Firebase SDK (v11) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set, update, remove, onValue, push }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyrLDmRDA-5-gVVzlPNX0CBx2wsmPcjXo",
  authDomain: "queue-42494.firebaseapp.com",
  databaseURL: "https://queue-42494-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "queue-42494",
  storageBucket: "queue-42494.firebasestorage.app",
  messagingSenderId: "364153731827",
  appId: "1:364153731827:web:c805926af590d1ae865586",
  measurementId: "G-BZB4RD5S9Q"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, get, set, update, remove, onValue, push };