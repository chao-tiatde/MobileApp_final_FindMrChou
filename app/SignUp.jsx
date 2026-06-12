import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import React, { useState } from 'react';
import { signUp } from '../services/authService';


// 在 SignUpScreen 中
export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSignUp = async () => {
  if (password !== confirmPassword) {
    Alert.alert("錯誤", "兩次密碼輸入不一致");
    return;
  }
  try {
    await signUp(email, password, displayName); // 傳入暱稱
    Alert.alert("註冊成功", "歡迎加入！");
    router.replace('/');
  } catch (error) {
    Alert.alert("註冊失敗", error.message);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      
<View style={styles.header}>
              <TouchableOpacity onPress={() => router.push('/personal')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#252736" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>註冊帳號</Text>
            </View>

      {/* 切換區 */}
      <View style={styles.switchContainer}>
        {/* 紫色背景 - 使用絕對定位固定偏移 */}
        <View style={[styles.activeIndicator, { left: '50%' }]} />
        
        <TouchableOpacity style={styles.switchButton} onPress={() => router.replace('/SignIn')}>
            <Text style={styles.inactiveText}>登入</Text>
        </TouchableOpacity>
        <View style={styles.switchButton}>
            <Text style={styles.activeText}>註冊</Text>
        </View>
        </View>


      <View style={styles.form}>

        <Text style={styles.label}>暱稱</Text>
        <TextInput 
        placeholder="請輸入暱稱" 
        style={styles.input} 
        onChangeText={setDisplayName} />

        <Text style={styles.label}>郵箱</Text>
        <TextInput placeholder="請輸入郵箱" style={styles.input} onChangeText={setEmail} autoCapitalize="none" />
        
        <Text style={styles.label}>密碼</Text>
        <TextInput placeholder="請輸入密碼" style={styles.input} secureTextEntry onChangeText={setPassword} />
        
        <Text style={styles.label}>確認密碼</Text>
        <TextInput placeholder="請再次輸入密碼" style={styles.input} secureTextEntry onChangeText={setConfirmPassword} />
        
        <TouchableOpacity style={styles.confirmButton} onPress={handleSignUp}>
          <Text style={styles.confirmButtonText}>確認註冊</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 樣式與 SignIn 共用，可考慮將共同樣式抽離到 constants/Styles.js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    height: 80,
    marginTop:40,
    marginBottom:40,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 50, // 抵銷 backButton 的寬度讓標題置中
  },
  switchContainer: {
    flexDirection: 'row',
    height: 45,
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center', // 讓整個區塊水平置中
    alignItems: 'center',
    marginBottom: 40,
    width: 200, // 給予切換區一個固定寬度
    alignSelf: 'center', // 讓容器本身水平置中
  },
  activeIndicator: {
    position: 'absolute',
    width: 90, // 固定寬度，確保能包覆「登入」或「註冊」文字
    height: '100%',
    backgroundColor: '#9370DB',
    borderRadius: 22, // 設定較大的半徑使其呈現圓角
    // 這裡我們不使用 left，而是透過 transform 來移動，會更平滑且精準
  },
  switchButton: {
    width: 100, // 兩邊各分一半寬度
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  inactiveText: { color: '#333', fontSize: 16 },
  form: { gap: 30, marginHorizontal:50, },
  label: { fontSize: 16, color: '#333', marginBottom: -25,fontWeight: 'bold'  },
  input: { borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 5, fontSize: 16 },
  confirmButton: { borderWidth: 1, borderRadius: 30, paddingVertical: 15, alignItems: 'center', marginTop: 30, backgroundColor:'#fff', },
  confirmButtonText: { fontSize: 18 }
});