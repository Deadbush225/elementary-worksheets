import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const dbService = {
  /**
   * Save player progress (tokens and prizes)
   */
  async savePlayerRecord(playerId: string, tokens: number, prizes: string[]) {
    try {
      const docRef = await addDoc(collection(db, "player_records"), {
        playerId,
        tokens,
        prizes,
        date: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document: ", error);
      return { success: false, error };
    }
  },

  /**
   * Get player's records history
   */
  async getPlayerRecords(playerId: string) {
    try {
      // We fetch all and sort client-side to avoid needing a composite index
      const q = query(
        collection(db, "player_records"), 
        where("playerId", "==", playerId)
      );
      
      const querySnapshot = await getDocs(q);
      const records: any[] = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by date DESC
      records.sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : 0;
        const dateB = b.date?.toMillis ? b.date.toMillis() : 0;
        return dateB - dateA;
      });
      
      return { success: true, data: records };
    } catch (error) {
      console.error("Error fetching documents: ", error);
      return { success: false, error };
    }
  },

  /**
   * Get player's profile (including last reset date)
   */
  async getPlayerProfile(playerId: string) {
    try {
      const docRef = doc(db, "player_profiles", playerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: true, data: { lastResetDate: null } };
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
      return { success: false, error };
    }
  },

  /**
   * Reset player's metrics count date
   */
  async resetPlayerCount(playerId: string) {
    try {
      const docRef = doc(db, "player_profiles", playerId);
      await setDoc(docRef, { lastResetDate: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error resetting player count: ", error);
      return { success: false, error };
    }
  }
};
