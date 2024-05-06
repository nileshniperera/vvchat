export const ViewCurrentSeekerChatTile = ({ seekerData }) => {
    return (
        <div className="view-guide-seeker-current-guide">
            <p>You are currently chatting with</p>
            <div className="horizontal-tile">
                <img src={seekerData.user_profile_picture} alt="guider" />
                <div className="vertical-tile">
                    <span className="highlight">{seekerData.displayName}</span>
                    <span className="normal">{seekerData.c_about}</span>
                </div>
            </div>
        </div>
    );
};
