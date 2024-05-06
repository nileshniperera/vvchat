import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { HEALTHBOT_IMG_URL } from "../../helpers/staticValues";
import { deleteSubCollection } from "./fieldFunctions";

export const createHealthbotChatroom = async (userID, displayName) => {
    // Step 1. Create new healthbot chat
    const healthbotChatCollection = collection(firestore, "healthbot");
    const newHealthbotChatRef = await addDoc(healthbotChatCollection, {
        user_uid: userID,
        createdAt: serverTimestamp(),
    });
    const newHealthbotChatId = newHealthbotChatRef.id;

    // Step 2. Create a sub collection. Messages
    const messagesCollection = collection(firestore, "healthbot", newHealthbotChatId, "messages");

    await addDoc(messagesCollection, {
        createdAt: serverTimestamp(),
        text: `Hi! ${displayName}, I am Aco, your healthbot. How can I help you today?`,
        photoURL: HEALTHBOT_IMG_URL,
        uid: "HEALTHBOT",
    });

    // Step 3. Return healthbot chat id
    return newHealthbotChatId;
};

export const deleteHealthbotChatroom = async (chatRoomId) => {
    const chatRoomRef = doc(firestore, "healthbot", chatRoomId);
    await deleteSubCollection(chatRoomRef, "messages");
    await deleteDoc(chatRoomRef);
};
