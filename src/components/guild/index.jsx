import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { Posts } from "../posts";
import { PostEditor } from "../editor";
import { useGuilds, useUsers } from "../../firebase/dataHooks.js";
import { createNewGuild, deleteGuild, joinGuild, leaveGuild } from "../../firebase/dbFunctions/guildFunctions.js";
import { Navigate, useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/auth.js";
import { CiLogout } from "react-icons/ci";

import { Main } from "../main";
import { SideNav } from "../sidenav";
import { IoMdClose } from "react-icons/io";
import { useCurrentUserData } from "../../firebase/dataHooks.js";
import { SingleImageUpload } from "../editor/singleImageUpload";
import { processSingleImgUpload } from "../../firebase/dbFunctions/commonFunctions.js";

import "./guild.css";

const Guild = () => {
    const [showModal, setShowModal] = useState(false);
    const [showModal2, setShowModal2] = useState(false);

    const closeModal = () => {
        setShowModal(false);
    };

    const closeModal2 = () => {
        setShowModal2(false);
    };

    const openModal2 = () => {
        setShowModal2(true);
    };

    const currentUserData = useCurrentUserData();
    const { currentUser, userLoggedIn, userType } = useAuth();
    const navigate = useNavigate();

    // Grab guild list and sort according to the user

    const guilds = useGuilds();
    const users = useUsers();

    const ownedGuilds = guilds.filter((guild) => guild.guild_owner_uid === currentUser.uid);
    const memberGuilds = guilds.filter((guild) => guild.guild_members.includes(currentUser.uid));
    // TODO: with current implementation, guiders will be part of other guilds as well. this is not intended

    const inGuilds = guilds.filter((guild) => {
        if (userType === "Guider") {
            return guild.guild_owner_uid === currentUser.uid;
        }
        return guild.guild_members.includes(currentUser.uid);
    });

    const [currentGuildPath, setCurrentGuildPath] = useState("");
    const [currentGuild, setCurrentGuild] = useState(inGuilds.length > 0 ? inGuilds[0] : null);

    useEffect(() => {
        if (!currentGuild && inGuilds.length > 0) {
            setCurrentGuild(inGuilds[0]);
            setCurrentGuildPath(`/guilds/${inGuilds[0].id}/posts`);
        }
        console.log("current Guild", currentGuild);
    }, [currentGuild, guilds]);

    const removeCurrentGuild = async (guildId) => {
        if (guildId === currentGuild.id) {
            setCurrentGuild(null);
            setCurrentGuildPath("");

            if (memberGuilds.length > 1) {
                const nextGuild = memberGuilds.find((i) => i.id !== guildId);

                setCurrentGuild(nextGuild);
                setCurrentGuildPath(`/guilds/${nextGuild.id}/posts`);
            }
        }
    };

    const handleCreateNewGuild = async (data, currentUserId) => {
        createNewGuild(data, currentUserId);
    };

    const handleGuildDelete = async (guildId, currentUserId) => {
        deleteGuild(guildId, currentUserId, users);
    };

    const handleJoinGuild = async (guildId, currentUserId) => {
        joinGuild(guildId, currentUserId);
    };

    const handleLeaveGuild = async (guildId, currentUserId) => {
        await leaveGuild(guildId, currentUserId);

        await removeCurrentGuild(guildId);
    };

    const handleGuildView = (guildId) => {
        setCurrentGuild(inGuilds[inGuilds.findIndex((guild) => guild.id === guildId)]);
        setCurrentGuildPath(`/guilds/${guildId}/posts`);
    };

    const createGuild = () => {};

    if (userType === null) {
        return <Navigate to={"/onboarding"} replace={true} />;
    }

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
                        <PostEditor postDbPath={currentGuildPath} authorUID={currentUser.uid} closeModal={closeModal} />
                    </div>
                </div>
            </div>
            <div className={`modal ${showModal2 ? "active" : ""}`}>
                <div className="modal-bg"></div>
                <div className="modal-fg">
                    <div className="modal-header flex place-items-center min-w-96 justify-between">
                        <p className="modal-subject">Create New Guild</p>
                        <button onClick={() => setShowModal2(false)}>
                            <IoMdClose />
                        </button>
                    </div>
                    <div className="modal-content modal-content-2">
                        <CreateNewGuild createGuild={createGuild} currentUserId={currentUser.uid} closeModal2={closeModal2} />
                    </div>
                </div>
            </div>
            {currentGuild && (
                <div className="app-top-bar flex flex-col place-items-center mb-6">
                    <div className="user-greeting">{currentGuild.guild_name}</div>
                    <div className="flex">
                        <input
                            className="dummy-post-input"
                            onClick={() => setShowModal(true)}
                            type="text"
                            id="post"
                            name="post"
                            value={`Post on ${currentGuild.guild_name}`}
                            readOnly
                            onChange={() => {}}
                        />
                        <img src={currentGuild.guild_image} alt="user-img" className="avatar-img greeting-btn" />
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to log out?")) {
                                    doSignOut().then(() => {
                                        navigate("/login");
                                    });
                                }
                            }}
                            className="logout"
                        >
                            <CiLogout />
                        </button>
                    </div>
                </div>
            )}
            <div className="flex app-container">
                <Main>
                    {currentGuild && (
                        <>
                            <Posts currentUserId={currentUser.uid} postDbPath={currentGuildPath} guildData={currentGuild} />
                            <div className="feed-bottom-padding"></div>
                        </>
                    )}
                    {!currentGuild && <p className="flex place-content-center mt-4">You aren't part of any of our guilds</p>}
                    {!currentGuild && userType === "Guider" && (
                        <div className="flex place-content-center mt-4 ">
                            <button onClick={() => openModal2()}>Let's create a new Guild +</button>
                        </div>
                    )}
                </Main>
                <SideNav>
                    {currentGuild && <GuildMemberList users={users} currentGuild={currentGuild} currentUserId={currentUser.uid} />}
                    {(userType === "Seeker" || (userType === "Guider" && ownedGuilds.length > 0)) && (
                        <GuildList
                            guilds={userType === "Seeker" ? guilds : ownedGuilds}
                            currentGuild={currentGuild}
                            userData={currentUserData}
                            userType={userType}
                            currentUserId={currentUser.uid}
                            handleGuildView={handleGuildView}
                            handleJoinGuild={handleJoinGuild}
                            handleGuildDelete={handleGuildDelete}
                            handleLeaveGuild={handleLeaveGuild}
                            openModal2={openModal2}
                        />
                    )}
                </SideNav>
            </div>
        </div>
    );
};

const CreateNewGuild = ({ createGuild, currentUserId, closeModal2 }) => {
    const [guildName, setGuildName] = useState("");
    const [guildSubject, setGuildSubject] = useState("");
    const [creatingGuild, setCreatingGuild] = useState(false);
    const [file, setFile] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setCreatingGuild(true);
        if (guildName && guildSubject && file) {
            try {
                const imgURL = await processSingleImgUpload(file);
                createNewGuild({ guildName, guildSubject, imgURL }, currentUserId);
            } catch (e) {
                console.log(e);
            }
        }
        setCreatingGuild(false);
        closeModal2();
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="mt-6">
                <label className="text-sm text-gray-600 font-bold">Guild Name</label>
                <input
                    type="text"
                    autoComplete="text"
                    required
                    value={guildName}
                    onChange={(e) => {
                        setGuildName(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                />
            </div>
            <div className="mt-6">
                <label className="text-sm text-gray-600 font-bold">What is the guild about?</label>
                <input
                    type="text"
                    autoComplete="text"
                    required
                    value={guildSubject}
                    onChange={(e) => {
                        setGuildSubject(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                />
            </div>
            <div className="guild-image-add add-image mt-6">
                <p>Add Image</p>
            </div>
            <SingleImageUpload file={file} setFile={setFile} />
            <button
                type="submit"
                disabled={creatingGuild}
                className={`mt-6 w-full px-4 py-2 text-white font-medium rounded-lg ${
                    creatingGuild ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                }`}
            >
                {creatingGuild ? "Creating Guild..." : "Create new guild"}
            </button>
        </form>
    );
};

const GuildMemberList = ({ users, currentGuild, currentUserId }) => {
    return (
        <div className="guild-member-list">
            {currentGuild.guild_members.map((member) => {
                const mem = users.find((user) => user.id === member);
                return (
                    <div className="member-tile guild-tile">
                        <img src={mem.user_profile_picture} alt="guild img" />
                        <div className="guild-lbls">
                            <p className="name">{mem.displayName}</p>
                            <p className="subject">{mem.c_about}</p>
                        </div>
                        {currentGuild.guild_owner_uid === mem.id && <p>(Owner)</p>}
                    </div>
                );
            })}
        </div>
    );
};

const GuildList = ({
    guilds,
    currentGuild,
    userData,
    userType,
    currentUserId,
    handleGuildView,
    handleLeaveGuild,
    handleJoinGuild,
    handleGuildDelete,
    openModal2,
}) => {
    // seekers
    const handleGuildJoin = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to join '${guildName}'`)) {
            handleJoinGuild(guildId, currentUserId);
        }
    };

    const handleGuildLeave = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to leave '${guildName}'?`)) {
            handleLeaveGuild(guildId, currentUserId);
        }
    };

    // guide
    const handleGuildDeletion = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to delete '${guildName}'?`)) {
            handleGuildDelete(guildId, currentUserId);
        }
    };

    return (
        <div className="seeker-guild-list">
            {userType === "Seeker" && <p className="seeker-guild-prompt">{currentGuild ? "Explore other guilds" : "Let's join guild"} →</p>}
            {userType === "Guider" && <p className="seeker-guild-prompt">Your guilds →</p>}
            {guilds.map((guild) => (
                <div className="guild-tile" key={guild.id}>
                    <img src={guild.guild_image} alt="guild img" />
                    <div className="guild-lbls">
                        <p className="name">{guild.guild_name}</p>
                        <p className="subject">{guild.guild_subject}</p>
                    </div>
                    <div className="guild-btns">
                        {userType === "Seeker" &&
                            (guild.guild_members.includes(currentUserId) ? (
                                <>
                                    {currentGuild && currentGuild.id !== guild.id && (
                                        <button onClick={() => handleGuildView(guild.id)}>Go to Guild</button>
                                    )}
                                    <button className="remove" onClick={() => handleGuildLeave(guild.id, guild.guild_name)}>
                                        Leave Guild
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleGuildJoin(guild.id, guild.guild_name)}>Join Guild</button>
                            ))}
                        {userType === "Guider" && (
                            <>
                                {currentGuild && currentGuild.id !== guild.id && (
                                    <button onClick={() => handleGuildView(guild.id)}>Go to Guild</button>
                                )}
                                <button className="remove" onClick={() => handleGuildDeletion(guild.id, guild.guild_name)}>
                                    Delete Guild
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
            {userType === "Guider" && (
                <p
                    onClick={() => {
                        openModal2();
                    }}
                    className="mt-8 create-new-guild-text"
                >
                    Create New Guild +
                </p>
            )}
        </div>
    );
};

const GuiderGuild = ({ currentUserId, guilds, createNewGuild, handleGuildDelete, handleGuildView, currentGuildPath, ownedGuilds }) => {
    const [guildName, setGuildName] = useState("");
    const [guildSubject, setGuildSubject] = useState("");
    const [creatingGuild, setCreatingGuild] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // useEffect(() => {
    //     console.log(currentGuildPath);
    // }, [currentGuildPath]);

    const handleGuildDeletion = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to delete '${guildName}'`)) {
            handleGuildDelete(guildId, currentUserId);
        }
    };

    const onSubmit = (e) => {
        const guildData = { guildName, guildSubject };
        setGuildName("");
        setGuildSubject("");
        e.preventDefault();
        if (!creatingGuild) {
            setCreatingGuild(true);
            setErrorMessage("");
            try {
                createNewGuild({ guildName: guildData.guildName, guildSubject: guildData.guildSubject }, currentUserId);
            } catch (e) {
                console.log(e);
            }
            setCreatingGuild(false);
        }
    };

    return (
        <div>
            <div className="create-new-guild">
                <h2>Create New Guild</h2>
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm text-gray-600 font-bold">Guild Name</label>
                        <input
                            type="text"
                            autoComplete="text"
                            required
                            value={guildName}
                            onChange={(e) => {
                                setGuildName(e.target.value);
                            }}
                            className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 font-bold">What is it about?</label>
                        <input
                            type="text"
                            autoComplete="text"
                            required
                            value={guildSubject}
                            onChange={(e) => {
                                setGuildSubject(e.target.value);
                            }}
                            className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                        />
                    </div>

                    {errorMessage && <span className="text-red-600 font-bold">{errorMessage}</span>}

                    <button
                        type="submit"
                        disabled={creatingGuild}
                        className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                            creatingGuild
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                        }`}
                    >
                        {creatingGuild ? "Creating Guild..." : "Create new guild"}
                    </button>
                </form>
            </div>
            <div className="guild-tiles">
                <GuildTiles userType="Guider" guildData={ownedGuilds} handleGuildRemove={handleGuildDeletion} handleGuildView={handleGuildView} />
            </div>

            {currentGuildPath && (
                <div className="posts">
                    <PostEditor postDbPath={currentGuildPath} authorUID={currentUserId} />
                    <Posts postDbPath={currentGuildPath} />
                </div>
            )}
        </div>
    );
};

const SeekerGuild = ({ currentUserId, guilds, handleSeekerJoiningGuild, handleSeekerGuildLeave, handleGuildView }) => {
    const handleGuildRemove = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to leave '${guildName}'`)) {
            handleSeekerGuildLeave(guildId, currentUserId);
        }
    };

    const handleGuildJoin = (guildId, guildName) => {
        if (window.confirm(`Are you sure you want to join '${guildName}'`)) {
            handleSeekerJoiningGuild(guildId, currentUserId);
        }
    };

    return (
        <div>
            <div className="guild-tiles">
                <GuildTiles
                    currentUserId={currentUserId}
                    userType="Seeker"
                    guildData={guilds}
                    handleGuildJoin={handleGuildJoin}
                    handleGuildRemove={handleGuildRemove}
                    handleGuildView={handleGuildView}
                />
            </div>
        </div>
    );
};

const GuildTiles = ({ currentUserId, userType, guildData, handleGuildRemove, handleGuildJoin, handleGuildView }) => {
    return (
        <div>
            {guildData.map((guild) => (
                <div key={guild.id}>
                    <p>{guild.guild_name}</p>
                    <p>{guild.guild_subject}</p>
                    {userType === "Seeker" &&
                        (guild.guild_members.includes(currentUserId) ? (
                            <>
                                <button onClick={() => handleGuildView(guild.id)}>Go to Guild</button>
                                <button onClick={() => handleGuildRemove(guild.id, guild.guild_name)}>Leave Guild</button>
                            </>
                        ) : (
                            <button onClick={() => handleGuildJoin(guild.id, guild.guild_name)}>Join Guild</button>
                        ))}
                    {userType === "Guider" && (
                        <>
                            <button onClick={() => handleGuildView(guild.id)}>Go to Guild</button>
                            <button onClick={() => handleGuildRemove(guild.id, guild.guild_name)}>Delete Guild</button>
                        </>
                    )}
                    <hr />
                    <br />
                </div>
            ))}
        </div>
    );
};

export default Guild;
