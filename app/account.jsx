// AccountScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. 引入 useRouter

const AccountScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const uid = params.uid;
  const username = params.username || "匿名使用者";
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 統一格式化時間的函式，防止資料庫日期格式報錯
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return d.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // 這裡務必確認 userId 是你的貼文欄位名稱
    const q = query(collection(db, "posts"), where("userId", "==", uid), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50, color: '#866CD1' }} />;

  return (
    <View style={styles.container}>
      {/* 1. 固定在最上方的 Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#252736" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人頁面</Text>
      </View>

      {/* 2. FlatList 負責內容，ListHeaderComponent 負責固定區域 */}
      <FlatList 
        data={userPosts} 
        keyExtractor={(item) => item.id}
        // 將個人頁面頭部設為 Header，它會隨著列表移動但不會被覆蓋
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Image 
              source={userPosts[0]?.userAvatar ? { uri: userPosts[0].userAvatar } : require('../img/personal1.png')} 
              style={styles.largeAvatar} 
            />
            <Text style={styles.title}>{username}</Text>
            <Text style={styles.subtitle}>共有 {userPosts.length} 篇貼文</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View>
                <Text style={styles.username}>{item.username || "匿名"}</Text>
                <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
               {item.tags?.map((tag, i) => <Text key={i} style={styles.tag}># {tag}</Text>)}
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>❤️ {item.likes?.length || 0}</Text>
              <Text style={[styles.statText, {marginLeft: 15}]}>🗨️ {item.comments?.length || 0}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>此用戶尚未發表任何貼文。</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF',paddingHorizontal:10 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, height: 100 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: 28 },
  profileHeader: { alignItems: 'center', padding: 40  },
  largeAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DDD' },
  title: { marginTop: 15, fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  // 卡片風格與 SocialScreen 保持一致
  postCard: { backgroundColor: '#866CD1', padding: 20, margin: 15, borderRadius: 25 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  timestamp: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  tagRow: { flexDirection: 'row', marginBottom: 10 },
  tag: { color: '#FFF', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, marginRight: 5, fontSize: 12 },
  content: { color: '#FFF', marginBottom: 15, fontSize: 16 },
  stats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', paddingTop: 10 },
  statText: { color: '#FFF', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default AccountScreen;