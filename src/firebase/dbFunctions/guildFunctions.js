import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";

import { addToUserList, removeFromUserList, addToGuildList, removeFromGuildList, deleteSubCollection } from "./fieldFunctions.js";

export const createNewGuild = async (data, currentUserId) => {
    const newGuildId = await processGuildCreation(data, currentUserId);
    await processAddGuildOwnerRecord(currentUserId, newGuildId);
    await joinGuild(newGuildId, currentUserId);
};

export const deleteGuild = async (guildId, currentUserId, users) => {
    // 1. Owner Record Remove
    await processRemoveGuildOwnerRecord(currentUserId, guildId);
    // 2. User Record Remove from all users
    await Promise.all(
        users.map(async (user) => {
            if (user.c_member_guild_ids.includes(guildId)) {
                await leaveGuild(guildId, user.id);
            }
        })
    );
    await processGuildDelete(guildId);
};

export const processGuildCreation = async (data, guildOwnerId) => {
    // Step 1: Create new guild record
    const guildCollection = collection(firestore, "guilds");
    const newGuildRef = await addDoc(guildCollection, {
        guild_name: data.guildName,
        guild_owner_uid: guildOwnerId,
        guild_subject: data.guildSubject,
        guild_image: data.imgURL,
        guild_members: [],
        createdAt: serverTimestamp(),
    });

    const newGuildId = newGuildRef.id;

    // Step 2: Create sub collection. posts
    const postsCollection = collection(firestore, "guilds", newGuildId, "posts");

    await addDoc(postsCollection, {
        createdAt: serverTimestamp(),
        post_author_uid: guildOwnerId,
        post_content: "<p>Please follow community guidelines when posting here. Thanks</p>",
        post_images: [data.imgURL],
        post_title: `Welcome to ${data.guildName}`,
        post_likes: [],
        post_comments: [],
    });
    return newGuildId;
};

export const processAddGuildOwnerRecord = async (guiderId, newGuildId) => {
    await addToUserList(guiderId, "g_owned_guild_ids", newGuildId);
};

export const processRemoveGuildOwnerRecord = async (guiderId, guildId) => {
    await removeFromUserList(guiderId, "g_owned_guild_ids", guildId);
};

export const processGuildDelete = async (guildId) => {
    // 1. delete guild sub collection posts
    const guildRef = doc(firestore, "guilds", guildId);
    await deleteSubCollection(guildRef, "posts");

    // 2. delete guild
    await deleteDoc(guildRef);
};

export const joinGuild = async (guildId, currentUserId) => {
    // 1. Add Guild ID to user data
    await addToUserList(currentUserId, "c_member_guild_ids", guildId);
    // 2. Add user id to build Guild list
    await addToGuildList(guildId, "guild_members", currentUserId);
};

export const leaveGuild = async (guildId, currentUserId) => {
    // 1. Add Guild ID to user data
    await removeFromUserList(currentUserId, "c_member_guild_ids", guildId);
    // 2. Add user id to build Guild list
    await removeFromGuildList(guildId, "guild_members", currentUserId);
};
