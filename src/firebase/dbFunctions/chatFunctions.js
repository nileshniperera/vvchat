import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { HEALTHBOT_IMG_URL, BRAIN_ID, API_KEY } from "../../helpers/staticValues";

export const addNewMessage = async (sendVal, dataPath, userData, currentUserId) => {
    const messagesRef = collection(firestore, dataPath);

    await addDoc(messagesRef, {
        createdAt: serverTimestamp(),
        photoURL: userData.user_profile_picture,
        text: sendVal,
        uid: currentUserId,
    });
};

export const addNewHealthbotMessage = async (sendVal, dataPath, currentUserId) => {
    const messagesRef = collection(firestore, dataPath);
    const url = `https://cors-anywhere.herokuapp.com/http://api.brainshop.ai/get?bid=${BRAIN_ID}&key=${API_KEY}&uid=${currentUserId}&msg=${sendVal}`;
    let healthbotResponse = "";

    await fetch(url)
        .then((response) => {
            // console.log("response received!", response);
            return response.json(); // Consume the response stream here
        })
        .then((data) => {
            // console.log("aco, healthbot response", data.cnt); // Use the parsed data here
            healthbotResponse = data.cnt;
        })
        .catch((error) => {
            console.error(error);
            healthbotResponse = "I'm sorry. I'm having trouble giving you are response";
        });

    if (!healthbotResponse) healthbotResponse = "I'm sorry. I'm having trouble giving you a response";

    await addDoc(messagesRef, {
        createdAt: serverTimestamp(),
        photoURL: HEALTHBOT_IMG_URL,
        text: healthbotResponse,
        uid: "HEALTHBOT",
    });
};
