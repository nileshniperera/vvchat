import { useEffect, useState, useContext } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate, useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/auth.js";
import { CiLogout } from "react-icons/ci";
import { Posts } from "../posts";

import { PostEditor } from "../editor";

import { Main } from "../main";
import { SideNav } from "../sidenav";
import { IoMdClose } from "react-icons/io";
import { useCurrentUserData } from "../../firebase/dataHooks.js";

const Feed = () => {
    const [showModal, setShowModal] = useState(false);

    const currentUserData = useCurrentUserData();
    const { currentUser, userLoggedIn, userType } = useAuth();
    const navigate = useNavigate();
    // TODO: ONBOARDING redirect has to be in RouteWrapper not here
    // redirect: new users to onboarding page
    if (userType === null) {
        return <Navigate to={"/onboarding"} replace={true} />;
    }

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="flex flex-col pt-14 feed-container">
            <div className={`modal ${showModal ? "active" : ""}`}>
                <div className="modal-bg"></div>
                <div className="modal-fg">
                    <div className="modal-header flex place-items-center min-w-96 justify-between">
                        <div className="modal-subject">New Post</div>
                        <button onClick={() => setShowModal(false)}>
                            <IoMdClose />
                        </button>
                    </div>
                    <div className="modal-content">
                        <PostEditor postDbPath="feed" authorUID={currentUser.uid} closeModal={closeModal} />
                    </div>
                </div>
            </div>
            {currentUserData?.user_profile_picture && (
                <div className="app-top-bar flex flex-col place-items-center mb-6">
                    <div className="user-greeting">Hi {currentUserData.displayName} 👋</div>
                    <div className="flex">
                        <input
                            className="dummy-post-input"
                            onClick={() => setShowModal(true)}
                            type="text"
                            id="post"
                            name="post"
                            value="What's on your mind?"
                            readOnly
                            onChange={() => {}}
                        />
                        <img src={currentUserData.user_profile_picture} alt="user-img" className="avatar-img greeting-btn" />
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to log out?")) {
                                    doSignOut().then(() => {
                                        navigate("/login");
                                    });
                                }
                            }}
                            className="logout greeting-btn"
                        >
                            <CiLogout />
                        </button>
                    </div>
                </div>
            )}
            <div className="flex app-container">
                <Main>
                    <Posts currentUserId={currentUser.uid} postDbPath="feed" />
                    <div className="feed-bottom-padding"></div>
                </Main>
                <SideNav></SideNav>
            </div>
        </div>
    );
};

export default Feed;
