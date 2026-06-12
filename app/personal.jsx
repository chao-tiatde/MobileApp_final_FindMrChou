import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { logout, updateAvatar } from '../services/authService';
import * as ImagePicker from 'expo-image-picker';
import BottomTab from '../components/BottomTab';

export default function PersonalScreen() {
  const router = useRouter();
  const { user, reloadUser } = useContext(AuthContext);

  const handleTodoAlert = () => Alert.alert('提示', '此功能還在開發中！');

  const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    Alert.alert("提示", "需要相簿權限才能更換頭像！");
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    try {
      // 將圖片轉換為 Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // 呼叫新的 updateAvatar 函數
      await updateAvatar(user.uid, blob); 
      
      // 釋放記憶體
      blob.close(); 
      
      await reloadUser();
      Alert.alert("成功", "頭像已更新！");
    } catch (e) {
      console.error("更新頭像失敗:", e);
      Alert.alert("錯誤", "無法更新頭像: " + e.message);
    }
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#252736" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人資料</Text>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarCircle} onPress={pickImage}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={80} color="#999" />
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.displayName || "訪客"}</Text>
      </View>

      <View style={styles.buttonGroup}>
        {user ? (
          <>
            <TouchableOpacity style={styles.grayButton} onPress={handleTodoAlert}>
              <Text style={styles.grayButtonText}>設置密碼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/SignIn')}>
              <Text style={styles.outlineButtonText}>切換帳號</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={logout}>
              <Text style={styles.outlineButtonText}>登出</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.grayButton} onPress={handleTodoAlert}>
              <Text style={styles.grayButtonText}>設置密碼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/SignIn')}>
              <Text style={styles.outlineButtonText}>登入帳號</Text>
            </TouchableOpacity>
            <Text style={styles.signUpText}>
            還沒有帳號？立即{' '}
            <Text 
              style={styles.signUpLink} 
              onPress={() => router.push('/SignUp')} // 假設您的註冊頁面路由為 /register
            >
              註冊
            </Text>{' '}
            ！
          </Text>
          </>
        )}
        
      </View>
      <BottomTab />
    </SafeAreaView>
  );
}

// 樣式請沿用您原本的即可，記得補上 cameraBadge 的樣式定義

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, height: 80, marginTop: 40 },
  backButton: { marginRight: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: 50 },
  avatarSection: { alignItems: 'center', marginTop: 50, marginBottom: 50 },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#333',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F5F5F5',
  },
  // 已移除 crossLine1 與 crossLine2
  buttonGroup: { paddingHorizontal: 40, gap: 35 },
  grayButton: { backgroundColor: '#fff', paddingVertical: 18, borderRadius: 100, borderWidth: 1.5, borderColor: '#000', alignItems: 'center' },
  grayButtonText: { fontSize: 18, color: '#000', fontWeight: '500' },
  outlineButton: { backgroundColor: '#fff', paddingVertical: 18, borderRadius: 100, borderWidth: 1.5, borderColor: '#000', alignItems: 'center' },
  outlineButtonText: { fontSize: 18, color: '#000', fontWeight: '500' },
  signUpText: { textAlign: 'center', fontSize: 18, color: '#333' },
  signUpLink: { color: '#7B68EE', textDecorationLine: 'underline', fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#333' },
});