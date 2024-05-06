import { useState, useRef } from "react";
import { usePosts, useUsers } from "../../firebase/dataHooks.js";
import "./posts.css";
import { getRelativeTime } from "../../helpers/helperFunctions.js";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { removeFromFeedList, addtoFeedList, addToGuildPostList, removeFromGuildPostList } from "../../firebase/dbFunctions/fieldFunctions.js";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { IoWarningSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { deletePost } from "../../firebase/dbFunctions/postFunctions.js";

export const Posts = ({ postDbPath, currentUserId, guildData = null }) => {
    const posts = usePosts(postDbPath);
    const users = useUsers();
    const [settingsOpenTo, setSettingsOpenTo] = useState("");

    return (
        <div className="posts">
            {posts ? (
                <div>
                    {posts.toReversed().map((post) => {
                        const user = users.find((user) => user.id === post.post_author_uid);
                        let userLiked = post.post_likes.includes(currentUserId);
                        // console.log("userliked", userLiked);

                        return (
                            <>
                                {user ? (
                                    <div className="post" key={post.id}>
                                        <div className="post-header">
                                            <div className={`post-settings ${settingsOpenTo === post.id ? "active" : ""} `}>
                                                <div className="post-s-header">
                                                    <div
                                                        onClick={() => {
                                                            setSettingsOpenTo("");
                                                        }}
                                                        className="s-header-close"
                                                    >
                                                        <IoMdClose />
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        (async () => {
                                                            if (window.confirm("Are you sure you want to delete this post")) {
                                                                await deletePost(post.id, postDbPath);
                                                                setSettingsOpenTo("");
                                                            }
                                                        })();
                                                    }}
                                                    className="s-content del"
                                                >
                                                    <span>Delete Post</span>
                                                    <div className="s-header-close">
                                                        <MdDelete />
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        alert("Thank you! The post has been submitted for review.");
                                                        setSettingsOpenTo("");
                                                    }}
                                                    className="s-content s-content-2"
                                                >
                                                    <span>Report Post</span>

                                                    <div className="s-header-close warn">
                                                        <IoWarningSharp />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="post-l1">
                                                <img src={user.user_profile_picture} alt="user profile" />
                                                <span>
                                                    <span className="dn">{user.displayName}</span> . {getRelativeTime(post.createdAt)}
                                                </span>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setSettingsOpenTo(post.id);
                                                }}
                                                className="post-l2"
                                            >
                                                <HiOutlineDotsHorizontal />
                                            </div>
                                        </div>
                                        <h2 className="post-title">{post.post_title}</h2>
                                        <div dangerouslySetInnerHTML={{ __html: post.post_content }} />
                                        {post.post_images.length > 0 && (
                                            <div className="image-carousel">
                                                {post.post_images.map((image, index) => (
                                                    <div key={index}>
                                                        <img src={image} alt="post content" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="interactions">
                                            <button
                                                onClick={() => {
                                                    if (userLiked) {
                                                        if (guildData) {
                                                            removeFromGuildPostList(guildData.id, post.id, "post_likes", currentUserId);
                                                        } else {
                                                            removeFromFeedList(post.id, "post_likes", currentUserId);
                                                        }
                                                    } else {
                                                        if (guildData) {
                                                            addToGuildPostList(guildData.id, post.id, "post_likes", currentUserId);
                                                        } else {
                                                            addtoFeedList(post.id, "post_likes", currentUserId);
                                                        }
                                                    }
                                                }}
                                            >
                                                {userLiked ? <BiSolidLike /> : <BiLike />}
                                            </button>
                                            {post.post_likes.length > 0 &&
                                                (() => {
                                                    const likedUser = users.find((user) => user.id === post.post_likes[0]);
                                                    return likedUser ? (
                                                        <span>
                                                            Liked by <span className="liked-user">{likedUser.displayName} </span>
                                                            {post.post_likes.length > 1 ? `and ${post.post_likes.length - 1} other` : ""}{" "}
                                                        </span>
                                                    ) : null;
                                                })()}
                                        </div>
                                        {/* <hr className="post-divider-2" /> */}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </>
                        );
                    })}
                </div>
            ) : (
                <NoContent message="Be the first to create a new post" />
            )}
        </div>
    );
};

const NoContent = ({ message }) => {
    return <div className="no-content">{message}</div>;
};
