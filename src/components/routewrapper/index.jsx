import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/authContext";

import { doc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.js";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useLoading } from "../../firebase/dataHooks.js";
import { doSignOut } from "../../firebase/auth.js";
import { useBlackList } from "../../firebase/dataHooks.js";

export const RouteWrapper = ({ Route }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const blacklist = useBlackList();

    const { currentUser, userLoggedIn, userType } = useAuth();
    const { userData, loading, error } = useLoading(currentUser);
    // const currentUserData = useCurrentUserData();

    useEffect(() => {
        if (currentUser) {
            if (blacklist.includes(currentUser.uid)) {
                doSignOut().then(() => {
                    navigate("/login");
                });
            }
        }
    }, [blacklist, currentUser, navigate]);

    if (location.pathname !== "/login" && location.pathname !== "/register") {
        // If the user is not logged in, redirect to the login page
        if (!userLoggedIn) {
            // console.log("sending user to login");
            return <Navigate to="/login" replace />;
        }

        if (userType === "ADMIN" && location.pathname !== "/admin") {
            return <Navigate to={"/admin"} replace={true} />;
        }

        if (userType !== "ADMIN" && location.pathname === "/admin") {
            return <Navigate to={"/feed"} replace={true} />;
        }

        // If data is still loading, show a loading screen
        if (loading) {
            return <div className="mt-14">Loading...</div>;
        }

        // If there's an error, show an error message
        if (error) {
            return <div>Error: {error.message}</div>;
        }
    }

    // Otherwise, render the children
    return <div>{<Route />}</div>;
};
