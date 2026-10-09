import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB64GgKHTXEjWtpxj-BbXv1gf7hRNC5W88",
  authDomain: "cuenta-clara-c3dac.firebaseapp.com",
  projectId: "cuenta-clara-c3dac",
  storageBucket: "cuenta-clara-c3dac.firebasestorage.app",
  messagingSenderId: "241468715243",
  appId: "1:241468715243:web:6874deea6c04872f3dceae"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
