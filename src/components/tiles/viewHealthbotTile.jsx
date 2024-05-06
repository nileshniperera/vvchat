import { HEALTHBOT_IMG_URL } from "../../helpers/staticValues.js";

export const ViewHealthbotTile = ({ children }) => {
    return (
        <div className="view-healthbot-tile">
            <span>
                You are chatting with <span className="text-purple-800">Healthbot (Beta)</span>
            </span>
            <img src={HEALTHBOT_IMG_URL} alt="chatbot-img" className="avatar-img border-2 border-purple-800" />
        </div>
    );
};
