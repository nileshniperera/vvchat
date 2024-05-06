// TODO: refactor to 'dbFunctions/dataFieldFunctions
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    deleteField,
    doc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    arrayRemove,
    addDoc,
    serverTimestamp,
    orderBy,
    limit,
} from "firebase/firestore";
import { firestore } from "../firebase";

// User Data Functions
export const updateUserData = async (uid, field, value) => {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { [field]: value });
};

export const nullifyUserData = async (uid, field) => {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { [field]: null });
};

export const addToUserList = async (uid, field, value) => {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { [field]: arrayUnion(value) });
};

export const removeFromUserList = async (uid, field, value) => {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, { [field]: arrayRemove(value) });
};

// ======================== Guild Data Functions ==========================================
export const updateGuildData = async (uid, field, value) => {
    const guildRef = doc(firestore, "guilds", uid);
    await updateDoc(guildRef, { [field]: value });
};

export const nullifyGuildData = async (uid, field) => {
    const guildRef = doc(firestore, "guilds", uid);
    await updateDoc(guildRef, { [field]: null });
};

export const addToGuildList = async (uid, field, value) => {
    const guildRef = doc(firestore, "guilds", uid);
    await updateDoc(guildRef, { [field]: arrayUnion(value) });
};

export const removeFromGuildList = async (uid, field, value) => {
    const guildRef = doc(firestore, "guilds", uid);
    await updateDoc(guildRef, { [field]: arrayRemove(value) });
};
//
export const deleteSubCollection = async (parentDocRef, subCollectionName) => {
    const subCollectionRef = collection(parentDocRef, subCollectionName);
    const subCollectionQuery = query(subCollectionRef);
    const subCollectionSnapshot = await getDocs(subCollectionQuery);
    const deletePromises = subCollectionSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

// ======================== Feed Data Functions ==========================================
export const addtoFeedList = async (uid, field, value) => {
    const feedRef = doc(firestore, "feed", uid);
    await updateDoc(feedRef, { [field]: arrayUnion(value) });
};

export const removeFromFeedList = async (uid, field, value) => {
    const feedRef = doc(firestore, "feed", uid);
    await updateDoc(feedRef, { [field]: arrayRemove(value) });
};

// ======================== Guild Data Functions ==========================================
export const addToGuildPostList = async (guildId, uid, field, value) => {
    const feedRef = doc(firestore, `guilds/${guildId}/posts/${uid}`);
    await updateDoc(feedRef, { [field]: arrayUnion(value) });
};

export const removeFromGuildPostList = async (guildId, uid, field, value) => {
    const feedRef = doc(firestore, `guilds/${guildId}/posts/${uid}`);
    await updateDoc(feedRef, { [field]: arrayRemove(value) });
};
