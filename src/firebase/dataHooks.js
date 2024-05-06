import { useEffect, useState } from "react";
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
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore";
import { firestore } from "./firebase";
import { useAuth } from "../contexts/authContext";

export const useGuilds = () => {
    const [guilds, setGuilds] = useState([]);

    useEffect(() => {
        const guildsRef = collection(firestore, "guilds");

        const unsubscribe = onSnapshot(guildsRef, (snapshot) => {
            const guildsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setGuilds(guildsData);
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    return guilds;
};

export const useCurrentUserData = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const userDocRef = doc(firestore, "users", currentUser.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                // console.log("No such document!");
            }
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, [currentUser.uid]); // Depend on currentUser.uid to re-subscribe if the user changes

    return userData;
};

export const useUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const usersRef = collection(firestore, "users");

        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setUsers(usersData);
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, []);

    return users;
};

export const usePosts = (path) => {
    // path could look like 'feed' or 'guilds/${guildId}/posts
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const postsRef = collection(firestore, path);
        const q = query(postsRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, [path]);

    return posts;
};

export const useLoading = (currentUser) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userRef = currentUser ? doc(firestore, "users", currentUser.uid) : null;
    const [userDoc, loadingDoc, errorDoc] = useDocumentData(userRef);

    useEffect(() => {
        if (userDoc) {
            setUserData(userDoc);
            setLoading(loadingDoc);
            setError(errorDoc);
        }
    }, [userDoc, loadingDoc, errorDoc]);

    return { userData, loading, error };
};

export const useChatData = (chatId, chatCollectionName) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (chatId) {
            const messageRef = collection(firestore, `${chatCollectionName}/${chatId}/messages`);
            const q = query(messageRef, orderBy("createdAt", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const postsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                setMessages(postsData);
            });

            return () => unsubscribe();
        }
    }, [chatId, chatCollectionName]);
    // console.log("chatid", chatId, messages);

    return messages;
};

export const useBlackList = () => {
    const [blackList, setBlackList] = useState([]);

    useEffect(() => {
        const userDocRef = doc(firestore, "deleteduserids", "pTWwcyIn2vY2JpmEkRUb");

        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setBlackList(docSnapshot.data().deletedUIDs); // Update the state with the new data
            } else {
                console.log("No such document!");
            }
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, []);

    return blackList; // Make sure to return the correct variable
};
