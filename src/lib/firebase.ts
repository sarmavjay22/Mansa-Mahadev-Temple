import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaPn0_unsRQiglxQ6FoAE7RkrJ8GCAWpA",
  authDomain: "poetic-bulwark-0lkqp.firebaseapp.com",
  projectId: "poetic-bulwark-0lkqp",
  storageBucket: "poetic-bulwark-0lkqp.firebasestorage.app",
  messagingSenderId: "654866763087",
  appId: "1:654866763087:web:a7224b964bc53de6ae893a"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const firestoreDb = getFirestore(
  app, 
  "ai-studio-mansamahadevtemp-dfa5bfd5-4cfe-474b-a85e-099a51ba9310"
);

// Validate Connection to Firestore (Critical constraint from Firebase Skill)
async function testConnection() {
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
      console.log("Firestore connection test completed:", error);
    }
  }
}

testConnection();
