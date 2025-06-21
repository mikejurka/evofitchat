import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB9jSfTiuvoE6CEuAZYA5EAdwrQ5pZcSO8",
  authDomain: "fitnesscoach-f154c.firebaseapp.com",
  projectId: "fitnesscoach-f154c",
  storageBucket: "fitnesscoach-f154c.firebasestorage.app",
  messagingSenderId: "489077691547",
  appId: "1:489077691547:web:59255c6d94e01dfab0623e"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account" // forces account chooser every time
});

export default app; 