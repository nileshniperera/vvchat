import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCBqG6ma1j9b_DLjy2zBacNXUl3kj04qXU",
    authDomain: "vvchat-64ba8.firebaseapp.com",
    projectId: "vvchat-64ba8",
    storageBucket: "vvchat-64ba8.appspot.com",
    messagingSenderId: "332416648460",
    appId: "1:332416648460:web:56407c884537acedcd3529",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, auth, firestore, analytics, storage };
