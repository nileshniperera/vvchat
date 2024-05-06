import { useRef, useState, useEffect } from "react";
import { addNewMessage, addNewHealthbotMessage } from "../../firebase/dbFunctions/chatFunctions.js";
import { FALLBACK_USER_IMG_URL } from "../../helpers/staticValues.js";
import { BsSend } from "react-icons/bs";

import "./chat.css";

export const Chat = ({ dataPath, chatData, userData, currentUserId, healthbot = false }) => {
    const dummy = useRef();
    const [sendVal, setSendVal] = useState("");

    useEffect(() => {
        setTimeout(() => {
            try {
                dummy.current.scrollIntoView({ behavior: "smooth" });
            } catch (e) {
                console.error("failed to scroll into view");
            }
        }, "500");
    }, [chatData]);

    const onSend = async () => {
        // Step 2: record user message on db
        await addNewMessage(sendVal, dataPath, userData, currentUserId);
        // Step 3:  record api message on db
        if (healthbot) {
            await addNewHealthbotMessage(sendVal, dataPath, currentUserId);
        }
        // Step 4: release lock on input
        setSendVal("");
    };

    return (
        <div className="chat">
            <div className="chat-message-list">
                {chatData && chatData.map((message) => <ChatMessage key={message.id} message={message} currentUserId={currentUserId} />)}
                <span ref={dummy}></span>
            </div>
            <div className="divider">
                <hr id="chat-hr" />
            </div>

            <div className="send-button">
                <textarea value={sendVal} onChange={(e) => setSendVal(e.target.value)} placeholder="What's on your mind?" />
                <button onClick={() => onSend()} disabled={!sendVal}>
                    <BsSend />
                </button>
            </div>
        </div>
    );
};

const ChatMessage = ({ message, currentUserId }) => {
    const { text, uid, photoURL } = message;
    return (
        <div className={`chat-message ${currentUserId === uid ? "reverse" : ""}`}>
            <div className="chat-message-img">
                <img src={photoURL || FALLBACK_USER_IMG_URL} alt="sender" />
            </div>
            <div className={`chat-message-textbox ${currentUserId === uid ? "user" : ""}`}>{text}</div>
        </div>
    );
};
