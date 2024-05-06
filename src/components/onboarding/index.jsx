import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate, useNavigate, Link } from "react-router-dom";

import { getFirestore, getDoc, updateDoc, doc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { useCurrentUserData } from "../../firebase/dataHooks.js";
import "./onboarding.css";
import { SingleImageUpload } from "../editor/singleImageUpload";
import { processSingleImgUpload } from "../../firebase/dbFunctions/commonFunctions.js";

const Onboarding = () => {
    const { currentUser, userLoggedIn, userType, setUserType } = useAuth();
    const [isGuide, setIsGuide] = useState(false);
    const [userBio, setUserBio] = useState("");
    const [isOnboarding, setIsOnboarding] = useState(false);
    const currentUserData = useCurrentUserData();
    const [activeImg, setActiveImg] = useState(0);
    const [file, setFile] = useState(null);
    const [doneOnboarding, setDoneOnboarding] = useState(false);
    const navigate = useNavigate();

    const images = [
        "https://firebasestorage.googleapis.com/v0/b/vvchat-3544d.appspot.com/o/post-images%2Fminions.png?alt=media&token=429f9c3c-ef1c-4e76-ad77-ecd8f192b199",
        "https://firebasestorage.googleapis.com/v0/b/vvchat-3544d.appspot.com/o/post-images%2Fdog.png?alt=media&token=2a485e43-d1f2-46a9-8657-2c47b49c30f5",
        "https://firebasestorage.googleapis.com/v0/b/vvchat-3544d.appspot.com/o/post-images%2Fzombie.png?alt=media&token=4645951a-688d-49f2-9601-946d04dbc91e",
        "https://firebasestorage.googleapis.com/v0/b/vvchat-3544d.appspot.com/o/post-images%2Fanime.png?alt=media&token=2d30c64f-f0d9-415f-b98a-c5ebfe21cf1d",
    ];

    useEffect(() => {
        if (file) {
            setActiveImg(5);
        } else {
            setActiveImg(0);
        }
    }, [file]);

    useEffect(() => {
        console.log("activeImg", activeImg);
    }, [activeImg]);

    useEffect(() => {
        if (doneOnboarding || userType) {
            window.location.replace("/feed");
        }
    }, [doneOnboarding, navigate, userType]);

    // redirect: keep off onboarded users from this page
    // if (doneOnboarding) {
    //     alert("navigating to feed");
    //     return <Navigate to={"/feed"} replace={true} />;
    // }

    const onboardUser = async () => {
        if (userBio && activeImg !== 0) {
            try {
                setIsOnboarding(true);
                let imgURL = images[0];
                if (activeImg === 5) {
                    imgURL = await processSingleImgUpload(file);
                } else {
                    imgURL = images[activeImg - 1];
                }

                const userRef = doc(firestore, "users", currentUser.uid);
                await updateDoc(userRef, { c_about: userBio });
                await updateDoc(userRef, { user_profile_picture: imgURL });
                await updateDoc(userRef, { user_type: isGuide ? "Guider" : "Seeker" });
            } catch (e) {
                console.log("error", e);
            }
        }
        await setDoneOnboarding(true);
    };

    // const onboardUser = async () => {
    //     setIsOnboarding(true);
    //     if (currentUser) {
    //         const userRef = doc(firestore, "users", currentUser.uid);
    //         await updateDoc(userRef, { user_type: type });
    //         setUserType(type);
    //         setIsGuide(flag);
    //     }
    // };

    return (
        <>
            <div className="onboarding">
                <h1>
                    Hi {currentUserData.displayName}! <span>Welcome to VVChat</span>
                </h1>
                <div className="ob-section">
                    <p>1. What role fits you best?</p>
                    <div className="role-btn-list">
                        <button
                            onClick={() => {
                                setIsGuide(true);
                            }}
                            className={`btn1 ${isGuide ? "active" : ""}`}
                        >
                            Licensed Psychologist
                        </button>
                        <button
                            onClick={() => {
                                setIsGuide(false);
                            }}
                            className={`btn2 ${!isGuide ? "active" : ""}`}
                        >
                            Not a psychologist
                        </button>
                    </div>
                </div>
                <div className="ob-section">
                    <p>
                        2. Write a short bio <span className="text-sm">({userBio.length} / 50)</span>
                    </p>
                    <textarea
                        type="text"
                        autoComplete="text"
                        required
                        value={userBio}
                        onChange={(e) => {
                            if (e.target.value.length < 47) setUserBio(e.target.value);
                        }}
                        className="user-bio"
                    />
                </div>
                <div className="ob-section">
                    <p>3. Select a profile picture</p>
                    <div className="image-select">
                        <img onClick={() => setActiveImg(1)} className={`${activeImg === 1 ? "active" : ""}`} src={images[0]} alt="minons" />
                        <img onClick={() => setActiveImg(2)} className={`${activeImg === 2 ? "active" : ""}`} src={images[1]} alt="dog" />
                        <img onClick={() => setActiveImg(3)} className={`${activeImg === 3 ? "active" : ""}`} src={images[2]} alt="zombie" />
                        <img onClick={() => setActiveImg(4)} className={`${activeImg === 4 ? "active" : ""}`} src={images[3]} alt="anime" />
                        <div
                            className={`${activeImg === 5 && file ? "active" : ""} ${file ? "file" : ""}`}
                            onClick={() => {
                                if (file) {
                                    setActiveImg(5);
                                }
                            }}
                        >
                            <SingleImageUpload file={file} setFile={setFile} />
                        </div>
                    </div>
                </div>
                <button
                    className="onboard-me"
                    disabled={activeImg === 0 || !userBio}
                    onClick={() => {
                        onboardUser();
                    }}
                >
                    {isOnboarding ? "Onboarding..." : "Let's get started →"}
                </button>
            </div>
        </>
    );
};

export default Onboarding;
{
    /* <div className="text-2xl font-bold pt-14 mt-5 ml-20">
                {isGuide === 0 ? (
                    <div>
                        <p className="font-medium text-3xl">Hi, {currentUser.displayName ? currentUser.displayName : currentUser.email}!!! 👋</p>
                        <p className="font-light text-xl">Let's get you onboarded!</p>
                    </div>
                ) : (
                    <div>
                        <p className="font-medium text-3xl mb-2">{currentUser.displayName ? currentUser.displayName : currentUser.email},</p>
                        <p className="font-medium text-xl">{isGuide === 1 ? guider_text : seeker_text}</p>
                    </div>
                )}
            </div>
            <div className="mt-10 ml-20">
                What fits you best?
                <button
                    className={`mx-2 border px-4 rounded-lg py-2 font-medium hover:bg-purple-600 transition duration-300 active:bg-gray-100 ${
                        isGuide === 1 && "bg-purple-600 text-white"
                    }`}
                    onClick={() => updateUserType("Guider", 1)}
                >
                    I am a licensed therapist
                </button>
                or
                <button
                    className={`mx-2 border px-4 rounded-lg py-2 font-medium hover:bg-purple-600 transition duration-300 active:bg-gray-100 ${
                        isGuide === 2 && "bg-purple-600 text-white"
                    }`}
                    onClick={() => updateUserType("Seeker", 2)}
                >
                    I am not
                </button>
            </div>

            <button
                className={`mx-20 mt-10 border border-r-0 border-l-0 px-4 py-2 font-medium hover:bg-gray-100 transition duration-300 active:bg-gray-100 ${
                    isGuide === 0 && "hidden bg-gray-300 cursor-not-allowed"
                }`}
                disabled={isGuide === 0}
                onClick={() => {
                    setIsOnboarding(false);
                    setIsGuide(null);
                }}
            >
                {isGuide === 0 ? "Choose an option" : isGuide === 1 ? "Continue as a Guider..." : "Continue as a Seeker..."}
            </button> */
}
