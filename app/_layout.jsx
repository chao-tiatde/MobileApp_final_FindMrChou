import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext'; // 確保路徑指向您的 context 檔案

export default function RootLayout() {
  return (
    // 使用 Provider 包裹整個 App，讓所有頁面都能讀取到 user 狀態
    <AuthProvider>
      <Slot /> 
    </AuthProvider>
  );
}