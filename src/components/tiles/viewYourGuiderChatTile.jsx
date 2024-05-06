export const ViewYourGuiderChatTile = ({ guiderData }) => {
    const guider = guiderData[0];
    return (
        <div className="view-guide-seeker-current-guide">
            <p>You are chatting with your guide</p>
            <div className="horizontal-tile">
                <img src={guider.user_profile_picture} alt="guider" />
                <div className="vertical-tile">
                    <span className="highlight">{guider.displayName}</span>
                    <span className="normal">{guider.c_about}</span>
                </div>
            </div>
        </div>
    );
};
