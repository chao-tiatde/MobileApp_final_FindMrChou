// authService.js
import { auth, db } from '../firebaseConfig'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore'; 



/**
 * 註冊功能
 * 將 photoURL 預設為空字串，防止 undefined 導致的資料庫錯誤
 */
export const signUp = async (email, password, displayName, photoURL = "") => {
  // 1. 建立帳號
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. 更新 Auth 個人檔案
  await updateProfile(user, { displayName, photoURL });

  // 3. 同步存入 Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    displayName,
    photoURL, // 現在這裡會是一個字串，不會是 undefined
    createdAt: new Date()
  });

  return userCredential;
};

/**
 * 更新頭像功能
 * 同步更新 Auth 資訊與 Firestore 資料庫
 */
export const updateAvatar = async (uid, newPhotoURL) => {
  const user = auth.currentUser;
  
  if (!user) throw new Error("無使用者登入");

  // 1. 更新 Firebase Auth 中的個人資料
  await updateProfile(user, { photoURL: newPhotoURL });

  // 2. 更新 Firestore 中的使用者文件
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    photoURL: newPhotoURL
  });
};

// 其他基本功能
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);