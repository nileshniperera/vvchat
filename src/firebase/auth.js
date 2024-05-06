import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

import { getFirestore, doc, setDoc, updateDoc, increment, runTransaction } from "firebase/firestore";
import { createHealthbotChatroom } from "./dbFunctions/healthbotFunctions";

const firestore = getFirestore();

const defaultUserFields = {
    c_healthbot_chatroom_id: null,
    c_about: null,
    c_member_guild_ids: [],
    displayName: null,
    g_owned_guild_ids: [],
    g_private_chatroom_ids: [],
    notifications: [],
    s_guider_uid: null,
    s_private_chatroom_id: null,
    user_profile_picture: null,
    user_type: null,
};

export const doCreateUserWithEmailAndPassword = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add or update user in Firestore
        const userRef = doc(firestore, "users", user.uid);

        // create healthbot chat For user
        const healthbotChatId = await createHealthbotChatroom(user.uid, displayName);
        await setDoc(
            userRef,
            { ...defaultUserFields, displayName: displayName, count: increment(1), c_healthbot_chatroom_id: healthbotChatId },
            { merge: true }
        );

        return userCredential;
    } catch (error) {
        throw error;
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Increment the count for the user in Firestore
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, { count: increment(1) });

        return userCredential;
    } catch (error) {
        throw error;
    }
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Add or update user in Firestore with default fields
    const userRef = doc(firestore, "users", user.uid);

    // we run a check to see if a document exists before we paste the default object to it
    await runTransaction(firestore, async (transaction) => {
        const docSnapshot = await transaction.get(userRef);

        if (!docSnapshot.exists()) {
            // create healthbot chatroom
            const healthbotChatId = await createHealthbotChatroom(user.uid, user.displayName);
            // If the document does not exist, set the default fields
            await transaction.set(userRef, {
                ...defaultUserFields,
                displayName: user.displayName,
                count: increment(1),
                c_healthbot_chatroom_id: healthbotChatId,
            });
        } else {
            // If the document exists, only increment the count
            await transaction.update(userRef, { count: increment(1) });
        }
    });
};

export const doSignOut = () => {
    return auth.signOut();
};

export const doPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
    return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/home`,
    });
};
