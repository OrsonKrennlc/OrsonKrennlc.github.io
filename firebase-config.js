// --- firebase-config.js ---
// 这是我们全局共享的 Firebase 配置文件

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAr13cV_zmXobB-lUmZjQphrTzNkkUyeKM",
  authDomain: "jerrysblog.firebaseapp.com",
  projectId: "jerrysblog",
  storageBucket: "jerrysblog.firebasestorage.app",
  messagingSenderId: "715734627266",
  appId: "1:715734627266:web:36ad06725b8a29518adc5b",
  measurementId: "G-XJPERC5VFG"
};

// 初始化 Firebase 应用
firebase.initializeApp(firebaseConfig);

// 创建一个所有脚本都能使用的全局数据库实例
const db = firebase.firestore();