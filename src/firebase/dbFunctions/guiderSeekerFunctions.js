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

import { updateUserData, nullifyUserData, addToUserList, removeFromUserList, deleteSubCollection } from "./fieldFunctions.js";

const processGuiderDataDelete = async (guider, guiderID, seeker, seekerId) => {
    await removeFromUserList(guiderID, "g_private_chatroom_ids", seeker.s_private_chatroom_id);
};

const processSeekerDataDelete = async (guider, guiderID, seeker, seekerId) => {
    await nullifyUserData(seekerId, "s_private_chatroom_id");
    await nullifyUserData(seekerId, "s_guider_uid");
};

const processChatRoomDataDelete = async (guider, guiderID, seeker, seekerId) => {
    // Step 1: Delete all documents in the 'messages' subcollection
    const chatRoomRef = doc(firestore, "chatrooms", seeker.s_private_chatroom_id);
    await deleteSubCollection(chatRoomRef, "messages");

    // Step 2: Delete the chat room
    await deleteDoc(chatRoomRef);
};

export const processGuiderDisconnect = async (guider, user) => {
    await processChatRoomDataDelete(guider, guider.id, user, user.id);
    await processSeekerDataDelete(guider, guider.id, user, user.id);
    await processGuiderDataDelete(guider, guider.id, user, user.id);
};

export const processSeekerDisconnect = async (seekerId) => {
    await processSeekerDataDelete(null, null, null, seekerId);
};
