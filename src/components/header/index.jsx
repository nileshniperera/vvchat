import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { useLoading } from "../../firebase/dataHooks.js";

const Header = () => {
    const navigate = useNavigate();
    const { userLoggedIn, userType, currentUser } = useAuth();
    const { userData, loading, error } = useLoading(currentUser);
    const location = useLocation();

    return (
        <nav
            className={`header ${
                location.pathname === "/feed" || location.pathname === "/guild" ? "non-bordered" : ""
            } flex flex-row gap-x-2 w-full z-20 h-12 place-content-center items-center bg-white ${
                location.pathname === "/onboarding" || location.pathname === "/admin" ? "hidden" : ""
            }`}
        >
            {userLoggedIn ? (
                !loading ? (
                    location.pathname !== "/onboarding" && (
                        <>
                            <NavLink className="text-sm text-blue-600 underline" to={"/feed"}>
                                For You
                            </NavLink>
                            <NavLink className="text-sm text-blue-600 underline" to={"/guild"}>
                                Guilds
                            </NavLink>
                            <NavLink className="text-sm text-blue-600 underline" to={"/guide-seeker"}>
                                {userType === "Guider" ? "Your Seekers" : "Your Guide"}
                            </NavLink>

                            {/* {userType === "Seeker" && ( */}
                            <NavLink className="text-sm text-blue-600 underline" to={"/healthbot"}>
                                Healthbot
                            </NavLink>

                            <p>{userType === "Seeker" ? "(Seeker)" : "(Guider)"}</p>
                        </>
                    )
                ) : (
                    <div className="flex space-x-2 justify-center items-center h-screen dark:invert">
                        <span className="sr-only">Loading...</span>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                    </div>
                )
            ) : (
                <>
                    <NavLink className="text-sm text-blue-600 underline" to={"/login"}>
                        Login
                    </NavLink>
                    <NavLink className="text-sm text-blue-600 underline" to={"/register"}>
                        Sign up
                    </NavLink>
                </>
            )}
        </nav>
    );
};

export default Header;
