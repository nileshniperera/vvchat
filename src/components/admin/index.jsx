import { useUsers, usePosts, useGuilds } from "../../firebase/dataHooks.js";
import "./admin.css";
import { deleteUser } from "../../firebase/dbFunctions/adminFunctions.js";
import { doSignOut } from "../../firebase/auth.js";
import { Navigate, useNavigate } from "react-router-dom";

export const Admin = () => {
    const users = useUsers();
    const navigate = useNavigate();
    const posts = usePosts("feed");
    const guilds = useGuilds();

    const handleDelete = (user) => {
        if (window.confirm(`Are you sure you want to delete '${user.displayName}' including all their data?`)) {
            deleteUser(user, users, posts, guilds);
        }
    };

    return (
        <div className="admin mt-14 flex place-content-center">
            {users.length > 0 && (
                <div className="admin-user-list">
                    <div className="a-top-btns">
                        <p className="acount">User Count: {users.length}</p>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to log out?")) {
                                    doSignOut().then(() => {
                                        navigate("/login");
                                    });
                                }
                            }}
                        >
                            Logout
                        </button>
                    </div>
                    {users.map((user) => (
                        <User key={user.id} user={user} handleDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

const User = ({ user, handleDelete }) => {
    return (
        <div className="user-tile">
            {user ? (
                <>
                    {user.user_type !== "ADMIN" ? (
                        <>
                            <div className="p1">
                                <img className="user-profile-pic" src={user.user_profile_picture} alt="img" />
                                <span className="user-name">{user.displayName}</span>
                                <span className="user-type">{user.user_type}</span>
                            </div>
                            <button
                                onClick={() => {
                                    handleDelete(user);
                                }}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <p className="aaadmin italic">CANNOT DELETE ADMIN USER '{user.displayName}'</p>
                    )}
                </>
            ) : (
                "failed to load user"
            )}
        </div>
    );
};
