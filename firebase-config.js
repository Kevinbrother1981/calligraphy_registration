// Firebase Configuration
// IMPORTANT: You need to fill in the missing values from your Firebase Console
// Go to Project Settings -> General -> Your apps -> SDK Setup and Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // The database URL you provided:
    databaseURL: "https://calligraphy-registration-35924-default-rtdb.firebaseio.com/",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (Compat version)
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database and make it globally available
const db = firebase.database();
