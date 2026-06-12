import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 當 Firebase 帳號狀態變更時自動執行
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 【新增】強制重新載入用戶資料的函式
  // 當你更改暱稱或頭像後，必須呼叫此函式來同步狀態
  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload(); // 從 Firebase 伺服器重新獲取最新資料
      setUser({ ...auth.currentUser }); // 強制觸發 React State 更新
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, reloadUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};