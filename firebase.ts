import { initializeApp, FirebaseError } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  // signInWithEmailAndPassword,
  GoogleAuthProvider,
  // signInWithRedirect,
  // getRedirectResult,
  // UserCredential,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (if not already initialized)
const app = initializeApp(firebaseConfig);

// Get Firebase services (only after initialization)
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const firebaseErrorHandler = (error: FirebaseError) => {
  let errorMessage = "";
  switch (error.code) {
    case "auth/email-already-in-use":
      errorMessage = "An account with this email already exists.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Incorrect email/password.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many attempts. Please try again later";
      break;
    default:
      errorMessage;
      "Oops! Something went wrong. Please try again later.";
  }
  return errorMessage;
};

export { app, auth, firestore, db, provider, firebaseErrorHandler };
