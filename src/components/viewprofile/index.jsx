import React from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";

const ViewProfile = () => {
    const { currentUser, userLoggedIn } = useAuth();

    if (!userLoggedIn) {
        return <Navigate to={"/login"} replace={true} />;
    }

    return (
        <>
            <div className="text-2xl font-bold pt-14">
                Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, Welcome to ViewProfile!
            </div>
        </>
    );
};

export default ViewProfile;
