import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { auth, firestore } from "../../firebase/firebase";
import { GoogleAuthProvider } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useKey } from "react-use";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState(null);
    const [authCount, setAuthCount] = useState(0);
    const location = useLocation();
    useEffect(() => {
        console.log("loading", loading);
    }, [loading]);

    const currentUserRef = useRef(currentUser);
    const locationRef = useRef(location.pathname);
    const navigate = useNavigate();

    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location]);

    // =============== changing the userType for testing ===============
    // useEffect(() => {
    //     console.log("User type has been updated:", userType);
    // }, [userType]);

    const handleEnterKeyPress = async (currentUser) => {
        // console.log("current user", currentUser);
        if (!currentUser) {
            // console.log("No current user, skipping action.");
            return;
        }

        // console.log("Enter detected");
        const guider = "Guider";
        const seeker = "Seeker";

        const userRef = doc(firestore, "users", currentUser.uid);

        // Fetch the current user type from Firestore
        const docSnap = await getDoc(userRef);
        const currentUserType = docSnap.exists() ? docSnap.data().user_type : null;

        // Determine the new user type
        const newUserType = currentUserType === guider ? seeker : guider;

        // Update the user type in Firestore
        await updateDoc(userRef, { user_type: newUserType });

        // Update the local state
        setUserType(newUserType);
    };

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useKey("Enter", () => {
        // if (currentUserRef.current & window.confirm("do you want to switch types?")) {
        //     handleEnterKeyPress(currentUserRef.current);
        // }
    });

    // useKey("Enter", () => {
    //     handleEnterKeyPress(currentUser);

    // });
    // =============== changing the userType for testing ===============

    useEffect(() => {
        // console.log("userType", userType);
    }, [userType]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user });

            // check if provider is email and password login
            const isEmail = user.providerData.some((provider) => provider.providerId === "password");
            setIsEmailUser(isEmail);

            // check if the auth provider is google or not
            // not a hundred percent sure if google user is identified like this. #TODO: investigate
            const isGoogle = user.providerData.some((provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID);
            setIsGoogleUser(isGoogle);

            setUserLoggedIn(true);

            // fetch user data from firestore
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            // no need to check if doc exists but keeping for best practice
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserType(userData.user_type); // Extract the user_type field

                // Update the context with the user_type
                setCurrentUser({ ...user, user_type: userType });
            } else {
                console.error("failed to retrieve user_type for logged in user 'AuthProvider>initializeUser'");
            }
        } else {
            // console.log("====================================on auth else block");
            setCurrentUser(null);
            setUserLoggedIn(false);
            setUserType(null);
        }

        setLoading(false);
    }

    const value = {
        userLoggedIn,
        isEmailUser,
        isGoogleUser,
        currentUser,
        userType,
        setUserType,
        setCurrentUser,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
