import { deleteHealthbotChatroom } from "./healthbotFunctions";
import { deletePosts } from "./postFunctions";
import { leaveGuild, deleteGuild } from "./guildFunctions";
import { processGuiderDisconnect, processSeekerDisconnect } from "./guiderSeekerFunctions";
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
import { firestore } from "./../firebase";

export const deleteUser = async (user, users, posts, guilds) => {
    // step 1. delete healthbot chatroom
    try {
        if (user.c_healthbot_chatroom_id) {
            await deleteHealthbotChatroom(user.c_healthbot_chatroom_id);
        }
    } catch (error) {
        console.log("error deleting healthbot chatroom", error);
    }

    // step 2. delete all posts from feed
    try {
        await deletePosts(user.id, posts, "feed");
    } catch (error) {
        console.log("error deleting posts from feed", error);
    }

    // step 3. handle member guild delete
    try {
        // 3.1 remove guild posts
        await removeMemberFromGuild(user, guilds);
    } catch (error) {
        console.log("error deleting member from guild", error);
    }

    // step 4. handle owned guild delete
    try {
        await deleteOwnedGuilds(user, guilds, users);
    } catch (error) {
        console.log("error deleting guild", error);
    }

    // step 6. remove seeker connection and delete chatroom (private id)
    try {
        if (user.s_guider_uid) {
            await removeGuiderAndRelatedData(user, users, user.s_guider_uid);
        }
    } catch (error) {
        console.log("error removing guider related data", error);
    }

    // step 7. remove guider connections and delete chatrooms
    try {
        if (user.g_private_chatroom_ids.length > 0) {
            await removeSeekersAndRelatedData(user, users);
        }
    } catch (error) {
        console.log("error removing seeker related data", error);
    }
    // step 8. delete user
    const userRef = doc(firestore, "users", user.id);
    await deleteDoc(userRef);

    // step 9. blacklist deleted user
    const blacklistRef = doc(firestore, "deleteduserids", "pTWwcyIn2vY2JpmEkRUb");
    await updateDoc(blacklistRef, { deletedUIDs: arrayUnion(user.id) });
};

const removeGuiderAndRelatedData = async (user, users, guiderID) => {
    const guider = users.find((guider) => guider.id === guiderID);
    await processGuiderDisconnect(guider, user);
};

const removeSeekersAndRelatedData = async (user, users) => {
    const allChats = await fetchChats();
    await Promise.all(
        allChats.map(async (chat) => {
            if (chat.guider_uid === user.id) {
                await processSeekerDisconnect(chat.seeker_uid);
            }
        })
    );
};

const fetchChats = async () => {
    const path = `chatrooms`;
    const postsRef = collection(firestore, path);
    const q = query(postsRef);

    try {
        const querySnapshot = await getDocs(q);
        const chats = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return chats;
    } catch (error) {
        console.error("Error fetching posts from guild:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const deleteOwnedGuilds = async (user, guilds, users) => {
    const ownedGuilds = guilds.filter((guild) => guild.guild_owner_uid === user.id);
    await Promise.all(
        ownedGuilds.map(async (guild) => {
            await deleteGuild(guild.id, user.id, users);
        })
    );
};

const removeMemberFromGuild = async (user, guilds) => {
    // Step 1: Filter guilds the user is a member of
    const memberGuilds = guilds.filter((guild) => guild.guild_members.includes(user.id));

    await Promise.all(
        memberGuilds.map(async (guild) => {
            const postsInGuild = await fetchPostsFromGuild(guild.id);
            const userPostsInGuild = postsInGuild.filter((post) => post.post_author_uid === user.id);
            await deletePosts(user.id, userPostsInGuild, guild.id);
            await leaveGuild(guild.id, user.id);
        })
    );
};

const fetchPostsFromGuild = async (guildId) => {
    const path = `guilds/${guildId}/posts`;
    const postsRef = collection(firestore, path);
    const q = query(postsRef, orderBy("createdAt", "asc"));

    try {
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        return postsData;
    } catch (error) {
        console.error("Error fetching posts from guild:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
