import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router'; // 1. 引入 useRouter
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import BottomTab from '../components/BottomTab';
import { Ionicons } from '@expo/vector-icons';

const moodMap = {
  '非常差': require('../img/very-bad.png'),
  '差': require('../img/bad.png'),
  '普通': require('../img/neutral.png'),
  '好': require('../img/good.png'),
  '非常好': require('../img/very-good.png'),
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
  return d.toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SocialScreen = () => {
  const router = useRouter(); // 2. 初始化 router
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 【修復關鍵】：兼容舊資料，如果沒 userId 就傳 username 讓 AccountScreen 處理
  const navigateToAccount = (userId, username) => {
    if (!userId && !username) {
      return Alert.alert("提示", "該使用者資訊異常，無法讀取個人頁面");
    }
    // 使用 router.push 代替 navigation.navigate
    router.push({ 
      pathname: '/account', // 請確保此路徑與你的 app 資料夾內的檔名一致
      params: { 
        uid: userId || null, 
        username: username || "匿名使用者" 
      } 
    });
  };

  const toggleLike = async (item) => {
    if (!auth?.currentUser) return Alert.alert("提示", "請先登入！");
    const postRef = doc(db, "posts", item.id);
    const uid = auth.currentUser.uid;
    if (item.likes?.includes(uid)) {
      await updateDoc(postRef, { likes: arrayRemove(uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(uid) });
    }
  };

  const handleSendComment = async (postId) => {
    if (!auth.currentUser) return Alert.alert("提示", "請先登入！");
    if (!commentText[postId]?.trim()) return;
    
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: auth.currentUser.uid, // 確保留言有寫入 ID
        username: auth.currentUser.displayName || "匿名",
        userAvatar: auth.currentUser.photoURL || null,
        text: commentText[postId],
        createdAt: new Date().toISOString()
      })
    });
    setCommentText({ ...commentText, [postId]: "" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        {/* 4. 修改返回邏輯 */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#252736" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>社群</Text>
      </View>

      <FlatList 
        data={posts} 
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {/* 貼文作者頭像 */}
            <View style={styles.postHeader}>
              <TouchableOpacity onPress={() => navigateToAccount(item.userId, item.username)}>
                <Image 
    source={item.userAvatar ? { uri: item.userAvatar } : require('../img/personal.png')} 
    style={styles.avatar} 
  />
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username || "匿名"}</Text>
                <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.tagRow}>
              {item.tags?.map((tag, i) => <Text key={i} style={styles.tag}># {tag}</Text>)}
              {item.mood && moodMap[item.mood] && (
                <Image source={moodMap[item.mood]} style={styles.moodImage} />
              )}
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.stats}>
              <TouchableOpacity onPress={() => toggleLike(item)} style={{flexDirection:'row'}}>
                <Text style={styles.statText}>❤️ {item.likes?.length || 0}</Text>
              </TouchableOpacity>
              <Text style={[styles.statText, {marginLeft: 15}]}>🗨️ {item.comments?.length || 0}</Text>
            </View>

            {/* 留言區 */}
            <View style={styles.comments}>
              {item.comments?.map((c, i) => (
                <View key={i} style={styles.commentItem}>
                  <TouchableOpacity onPress={() => navigateToAccount(c.userId, c.username)}>
                    <Image 
                      source={c.userAvatar ? { uri: c.userAvatar } : require('../img/personal1.png')} 
                      style={styles.commentAvatar} 
                    />
                  </TouchableOpacity>
                  <View style={styles.commentContent}>
                    <View style={styles.commentRow}>
                      <Text style={styles.commentUser}>{c.username}</Text>
                      <Text style={styles.commentTime}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : ""}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input}
                placeholder={`以 ${auth.currentUser?.displayName || "匿名"} 身分回應...`}
                value={commentText[item.id] || ""}
                onChangeText={(text) => setCommentText({...commentText, [item.id]: text})}
              />
              <TouchableOpacity onPress={() => handleSendComment(item.id)}>
                <Ionicons name="send" size={20} color="#866CD1" style={{marginRight: 10}} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BottomTab />
    </View>
  );
};

// Styles 保持不變...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF',paddingHorizontal:8 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, height: 100 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: 28 },
  postCard: { backgroundColor: '#866CD1', padding: 20, margin: 15, borderRadius: 25 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#FFF', marginRight: 15 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  timestamp: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  moodImage: { height: 25, width: 25, marginLeft: 10 },
  tagRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  tag: { color: '#FFF', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, marginRight: 5, fontSize: 12 },
  content: { color: '#FFF', marginBottom: 10, fontSize: 16 },
  stats: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 10, marginBottom: 10 },
  statText: { color: '#FFF', fontSize: 16 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10, backgroundColor: '#DDD' },
  commentContent: { flex: 1 },
  commentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  commentUser: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  commentTime: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  commentText: { color: '#FFF', fontSize: 13, marginTop: 2 },
  inputRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 100, paddingHorizontal: 15, marginTop: 10, alignItems: 'center', height: 45 },
  input: { flex: 1 }
});

export default SocialScreen;