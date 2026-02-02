// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyArkHnEyRb8JbMnGzzMvw6hloPONcAIe1Q",
    authDomain: "creat-eac37.firebaseapp.com",
    projectId: "creat-eac37",
    storageBucket: "creat-eac37.firebasestorage.app",
    messagingSenderId: "151348049220",
    appId: "1:151348049220:web:99803f2bc1953e7e559311",
    // Database URL is required for Realtime Database, especially for non-US regions
    databaseURL: "https://creat-eac37-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase (Compat version)
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and make it globally available
const db = firebase.database();
