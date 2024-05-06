import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";
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
import { firestore } from "../../firebase/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
    updateUserData,
    nullifyUserData,
    addToUserList,
    removeFromUserList,
    deleteSubCollection,
} from "../../firebase/dbFunctions/fieldFunctions.js";
import { objIsEmpty } from "../../helpers/helperFunctions.js";

import { useCurrentUserData, useUsers, useChatData } from "../../firebase/dataHooks.js";
import { ViewYourGuiderChatTile } from "../tiles/viewYourGuiderChatTile";
import { ViewCurrentSeekerChatTile } from "../tiles/viewCurrentSeekerChatTile";

import { Main } from "../main";
import { SideNav } from "../sidenav";
import { TopNav } from "../topnav";

import { Chat } from "../chat";
import "./guiderseeker.css";

const GuideSeeker = () => {
    const { currentUser, userLoggedIn, userType } = useAuth();

    const userData = useCurrentUserData();
    const users = useUsers();

    const guiderList = users.filter((user) => user.user_type === "Guider");
    const connectedSeekerList = users.filter((user) => user.user_type === "Seeker" && user.s_guider_uid === currentUser.uid);

    // ============= Database Connections : END ================

    const createChatRoom = async (guider) => {
        const chatRoomsCollection = collection(firestore, "chatrooms");
        const newChatRoomRef = await addDoc(chatRoomsCollection, {
            guider_uid: guider.id,
            seeker_uid: currentUser.uid,
        });

        // console.log("Chat room document written with ID: ", newChatRoomRef.id);

        // Step 2: Save the auto-generated ID in a variable
        const chatRoomId = newChatRoomRef.id;

        // Step 3: Create a nested collection named 'messages' within the newly created document
        // This step is optional if you're just creating the 'messages' collection for future use
        // If you want to add a message immediately, you can do so here
        const messagesCollection = collection(firestore, "chatrooms", chatRoomId, "messages");
        // Example: Add a placeholder message to the 'messages' collection
        await addDoc(messagesCollection, {
            createdAt: serverTimestamp(),
            text: `Hi! I'm ${guider.displayName}, how can I help you?`,
            photoURL: null,
            uid: guider.id,
        });

        // console.log("Messages collection created for chat room ID: ", chatRoomId);
        return chatRoomId;
    };

    const processGuiderDataDelete = async (guider, guiderID, seeker, seekerId) => {
        // Step 2: remove chat room id from guider
        await removeFromUserList(guiderID, "g_private_chatroom_ids", seeker.s_private_chatroom_id);
    };

    const processSeekerDataDelete = async (guider, guiderID, seeker, seekerId) => {
        // Step 1: nullify seeker's s_private_chatroom_id value
        await nullifyUserData(seekerId, "s_private_chatroom_id");

        // Step 2: nullify seeker's s_guider_uid value
        await nullifyUserData(seekerId, "s_guider_uid");
    };

    const processChatRoomDataDelete = async (guider, guiderID, seeker, seekerId) => {
        // Step 1: Delete all documents in the 'messages' subcollection
        const chatRoomRef = doc(firestore, "chatrooms", seeker.s_private_chatroom_id);
        await deleteSubCollection(chatRoomRef, "messages");

        // Step 2: Delete the chat room
        await deleteDoc(chatRoomRef);
    };

    const processGuiderDisconnect = async (guider) => {
        // Step 1: Delete the chat room document
        await processChatRoomDataDelete(guider, guider.id, userData, currentUser.uid);
        // Step 2: Delete all connection data from Seeker
        await processSeekerDataDelete(guider, guider.id, userData, currentUser.uid);
        // Step 3: Delete all connection data from Guider
        await processGuiderDataDelete(guider, guider.id, userData, currentUser.uid);
    };

    const processGuiderConnect = async (guider) => {
        const chatRoomId = await createChatRoom(guider);
        // console.log("chatroom created", chatRoomId);
        await updateUserData(currentUser.uid, "s_private_chatroom_id", chatRoomId);
        await addToUserList(guider.id, "g_private_chatroom_ids", chatRoomId);
        await updateUserData(currentUser.uid, "s_guider_uid", guider.id);
    };

    const processSeekerDisconnect = async (seeker) => {
        // Step 1: Delete the chat room document
        // Step 2: Delete all connection data from Seeker
        await processSeekerDataDelete(userData, currentUser.uid, seeker, seeker.id);
        // Step 3: Delete all connection data from Guider
        await processGuiderDataDelete(userData, currentUser.uid, seeker, seeker.id);
    };

    const handleSeekerDisconnect = (seeker) => {
        if (window.confirm(`Are you sure you want to disconnect ${seeker.displayName}?`)) {
            processSeekerDisconnect(seeker);
        }
    };

    const handleGuiderConnectDisconnect = async (guider, disconnectGuider) => {
        try {
            if (disconnectGuider) {
                if (window.confirm(`Are you sure you want to disconnect ${guider.displayName}?`)) {
                    await processGuiderDisconnect(guider);
                }
            } else {
                if (userData.s_guider_uid) {
                    const currentGuider = guiderList.find((guider) => guider.id === userData.s_guider_uid);
                    if (
                        window.confirm(
                            `Are you sure you want to connect with ${guider.displayName}? You will be disconnected with ${currentGuider.displayName} and all chat data will be deleted. Press 'ok' to confirm`
                        )
                    ) {
                        await processGuiderDisconnect(currentGuider);
                        await processGuiderConnect(guider);
                    }
                } else {
                    if (window.confirm(`Are you sure you want to connect with ${guider.displayName}?`)) {
                        await processGuiderConnect(guider);
                    }
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };
    if (userType === null) {
        return <Navigate to={"/onboarding"} replace={true} />;
    }
    // ====================================================================================

    return (
        <>
            <div className="flex">
                {userType === "Guider" ? (
                    <Guider
                        userData={userData}
                        currentUserId={currentUser.uid}
                        connectedSeekerList={connectedSeekerList}
                        handleSeekerDisconnect={handleSeekerDisconnect}
                    />
                ) : (
                    <Seeker
                        userData={userData}
                        currentUserId={currentUser.uid}
                        guiderList={guiderList}
                        handleGuiderConnectDisconnect={handleGuiderConnectDisconnect}
                    />
                )}
            </div>
        </>
    );
};

const Guider = ({ userData, currentUserId, connectedSeekerList, handleSeekerDisconnect }) => {
    const [currentSeeker, setCurrentSeeker] = useState(null);
    const [currentChatId, setCurrentChatId] = useState("");
    const chatData = useChatData(currentChatId, "chatrooms");

    const handleViewSeekerChat = (seeker) => {
        setCurrentSeeker(seeker);
        setCurrentChatId(seeker.s_private_chatroom_id);
    };

    const _handleSeekerDisconnect = (seeker) => {
        // if viewing chat that is being deleted
        if (currentSeeker.id === seeker.id) {
            if (connectedSeekerList.length > 1) {
                if (seeker.id !== connectedSeekerList[0].id) {
                    setCurrentChatId(connectedSeekerList[0].s_private_chatroom_id);
                    setCurrentSeeker(connectedSeekerList[0]);
                } else {
                    setCurrentChatId(connectedSeekerList[1].s_private_chatroom_id);
                    setCurrentSeeker(connectedSeekerList[1]);
                }
            } else {
                setCurrentChatId("");
            }
        }
        handleSeekerDisconnect(seeker);
    };

    useEffect(() => {
        if (connectedSeekerList.length === 0) return;

        if (!currentChatId) {
            setCurrentChatId(connectedSeekerList[0].s_private_chatroom_id);
            setCurrentSeeker(connectedSeekerList[0]);
        }
    }, [connectedSeekerList]);

    return (
        <>
            <Main>
                {connectedSeekerList.length === 0 && <div className="place-content-center flex mt-20">You have no connected seekers</div>}
                {connectedSeekerList.length > 0 && currentChatId && (
                    <Chat dataPath={`chatrooms/${currentChatId}/messages`} chatData={chatData} userData={userData} currentUserId={currentUserId} />
                )}
            </Main>
            <SideNav>
                {connectedSeekerList.length > 0 && currentSeeker && <ViewCurrentSeekerChatTile seekerData={currentSeeker} />}
                {connectedSeekerList.length > 0 && currentSeeker && (
                    <SeekerList
                        currentSeeker={currentSeeker}
                        connectedSeekerList={connectedSeekerList}
                        handleSeekerDisconnect={_handleSeekerDisconnect}
                        handleViewSeekerChat={handleViewSeekerChat}
                    />
                )}
            </SideNav>
        </>
    );
};

const SeekerList = ({ currentSeeker, connectedSeekerList, handleSeekerDisconnect, handleViewSeekerChat }) => {
    return (
        <div className="seeker-list">
            <p>Select a seeker to chat with</p>
            {connectedSeekerList.map((seeker) => (
                <SeekerListTile
                    key={seeker.id}
                    seeker={seeker}
                    currentSeeker={currentSeeker}
                    handleSeekerDisconnect={handleSeekerDisconnect}
                    handleViewSeekerChat={handleViewSeekerChat}
                />
            ))}
        </div>
    );
};

const SeekerListTile = ({ seeker, currentSeeker, handleSeekerDisconnect, handleViewSeekerChat }) => {
    return (
        <div className="guider-list-tile">
            <div className="horizontal-tile">
                <img src={seeker.user_profile_picture} alt="guider" />
                <div className="vertical-tile">
                    <span className="highlight">{seeker.displayName}</span>
                    <span className="normal">{seeker.c_about}</span>
                </div>
            </div>
            <div className="buttons">
                {seeker.id !== currentSeeker.id && (
                    <button className="mr-2" onClick={() => handleViewSeekerChat(seeker)}>
                        Go to Chat
                    </button>
                )}
                <button onClick={() => handleSeekerDisconnect(seeker)}>Disconnect</button>
            </div>
        </div>
    );
};

const Seeker = ({ userData, currentUserId, guiderList, handleGuiderConnectDisconnect }) => {
    const [currentChatId, setCurrentChatId] = useState("");
    const chatData = useChatData(currentChatId, "chatrooms");

    useEffect(() => {
        if (objIsEmpty(userData)) return;

        setCurrentChatId(userData.s_private_chatroom_id);
    }, [userData]);

    return (
        <>
            <Main>
                {chatData.length === 0 && <div>You haven't connected with a guider yet</div>}
                {currentChatId && (
                    <Chat dataPath={`chatrooms/${currentChatId}/messages`} chatData={chatData} userData={userData} currentUserId={currentUserId} />
                )}
            </Main>
            <SideNav>
                {guiderList.length > 0 && !objIsEmpty(userData) && userData.s_guider_uid && (
                    <ViewYourGuiderChatTile guiderData={guiderList.filter((guider) => guider.id === userData.s_guider_uid)} />
                )}
                {guiderList.length > 0 && (
                    <GuiderList
                        hasGuider={chatData.length > 0}
                        guiderList={guiderList}
                        currentUserId={currentUserId}
                        handleGuiderConnectDisconnect={handleGuiderConnectDisconnect}
                        userData={userData}
                    />
                )}
            </SideNav>
        </>
    );
};

const GuiderList = ({ hasGuider, guiderList, currentUserId, handleGuiderConnectDisconnect, userData }) => {
    return (
        <div className="guider-list">
            <p>{hasGuider ? "Connect with someone else?" : "Connect with a guide to start chatting!"}</p>
            {guiderList
                // the way the data is modelled, each user technically can be seeker and guider, (especially in test accounts), therefore I've added a check to exclude current user from seeker list.
                .filter((guider) => guider.id !== currentUserId) // Exclude the current user
                .map((guider) => (
                    <>
                        <GuiderListTile
                            key={guider.id}
                            guider={guider}
                            handleGuiderConnectDisconnect={handleGuiderConnectDisconnect}
                            isCurrentGuider={userData.s_guider_uid === guider.id}
                        />
                    </>
                ))}
        </div>
    );
};

const GuiderListTile = ({ guider, handleGuiderConnectDisconnect, isCurrentGuider }) => {
    return (
        <div className="guider-list-tile">
            <div className="horizontal-tile">
                <img src={guider.user_profile_picture} alt="guider" />
                <div className="vertical-tile">
                    <span className="highlight">{guider.displayName}</span>
                    <span className="normal">{guider.c_about}</span>
                </div>
            </div>
            <button className={`${isCurrentGuider ? "disconnect" : ""}`} onClick={() => handleGuiderConnectDisconnect(guider, isCurrentGuider)}>
                {isCurrentGuider ? "Disconnect" : "Connect"}
            </button>
        </div>
    );
};

export default GuideSeeker;
