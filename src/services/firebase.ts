import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Configuração directa com os dados do projecto Firebase "waking-actor-bcb1c"
// Garante funcionamento permanente na Vercel e no GitHub sem perder ligação à nuvem.
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "waking-actor-bcb1c",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1030810760915:web:fc11ba2269d8da1e6e0626",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAxAPfd-o7WsRsUcSeAKsXohQ-SZwYOpAY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "waking-actor-bcb1c.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-chrmata-636d1412-3125-402e-ad9e-6a4e553fa571",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "waking-actor-bcb1c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1030810760915",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Testa a ligação com o banco de dados Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'categories', 'cat_salario'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Serviço Firebase offline ou a reconectar...');
    }
    return false;
  }
}
