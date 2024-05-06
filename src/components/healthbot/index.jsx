import { useEffect } from "react";
import { Main } from "../main";
import { SideNav } from "../sidenav";
import { ViewHealthbotTile } from "../tiles/viewHealthbotTile";
import { Chat } from "../chat";
import { useAuth } from "../../contexts/authContext";
import { useCurrentUserData, useChatData } from "../../firebase/dataHooks.js";
import { Navigate, useNavigate } from "react-router-dom";

const Healthbot = () => {
    const { currentUser, userLoggedIn, userType } = useAuth();

    const userData = useCurrentUserData();
    const chatData = useChatData(userData.c_healthbot_chatroom_id, "healthbot");

    if (userType === null) {
        return <Navigate to={"/onboarding"} replace={true} />;
    }

    return (
        <>
            <div className="flex app-container">
                <Main>
                    <Chat
                        dataPath={`healthbot/${userData.c_healthbot_chatroom_id}/messages`}
                        chatData={chatData}
                        userData={userData}
                        currentUserId={currentUser.uid}
                        healthbot={true}
                    />
                </Main>
                <SideNav>
                    <ViewHealthbotTile />
                </SideNav>
            </div>
        </>
    );
};

export default Healthbot;
