import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB4mwPXZ-SSO1HXgB3iarj4m7paofvetGY",
    authDomain: "vvchat-3544d.firebaseapp.com",
    projectId: "vvchat-3544d",
    storageBucket: "vvchat-3544d.appspot.com",
    messagingSenderId: "195640033941",
    appId: "1:195640033941:web:6a80849962589b7358d19c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, auth, firestore, analytics, storage };
