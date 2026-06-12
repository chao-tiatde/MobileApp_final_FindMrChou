import { create } from 'zustand';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // 確保路徑正確

export const useDreamStore = create((set, get) => ({
  // 1. 夢境資料庫
  dreams: {}, 

  // 2. 全局選中的日期
  selectedDate: new Date().toLocaleDateString('sv-SE'),

  // 3. 動作：更新選中的日期
  setSelectedDate: (date) => set({ selectedDate: date }),

  // 4. 動作：從雲端同步所有資料 (建議在 App 啟動時呼叫一次)
  fetchDreams: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const querySnapshot = await getDocs(collection(db, 'users', userId, 'dreams'));
      const fetchedDreams = {};
      querySnapshot.forEach((doc) => {
        fetchedDreams[doc.id] = doc.data();
      });
      set({ dreams: fetchedDreams });
    } catch (error) {
      console.error("讀取夢境失敗:", error);
    }
  },

  // 5. 動作：新增或更新夢境
  addDream: async (data) => {
    // 【核心修正】：不管有沒有登入，先更新本地狀態，畫面才會立刻變動！
    set((state) => ({
      dreams: {
        ...state.dreams,
        [data.date]: data
      }
    }));

    // 接著，檢查是否有登入，有的話才同步到 Firebase
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const docRef = doc(db, 'users', userId, 'dreams', data.date);
        await setDoc(docRef, data, { merge: true });
      } catch (error) {
        console.error("雲端同步失敗:", error);
      }
    }
  },

  // 6. 動作：刪除夢境
  deleteDream: async (date) => {
    // 【核心修正】：先刪除本地
    set((state) => {
      const newDreams = { ...state.dreams };
      delete newDreams[date];
      return { dreams: newDreams };
    });

    // 若有登入，才去刪除雲端
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'dreams', date));
      } catch (error) {
        console.error("雲端刪除失敗:", error);
      }
    }
  },
}));