import { useState, useEffect } from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";

import { ImageUpload } from "./imageUpload";
import { MenuBar } from "./menuBar";

import { processImgUpload, processPostCreation } from "../../firebase/dbFunctions/postFunctions.js";
import "./editor.css";

export const PostEditor = ({ postDbPath, authorUID, closeModal }) => {
    const [postTitle, setPostTitle] = useState("");
    const [postImgs, setPostImgs] = useState([]);
    const [files, setFiles] = useState([]);
    const [uploadedImgURLs, setUploadedImgURLs] = useState([]);
    const [blockNewPost, setBlockNewPost] = useState(false);

    const editor = useEditor({
        extensions: [
            Color.configure({ types: [TextStyle.name, ListItem.name] }),
            TextStyle.configure({ types: [ListItem.name] }),
            StarterKit.configure({}),
        ],
        content: "<p>Build your post...</p>",
    });

    const handlePostSave = async () => {
        // step 1. disable new post creation
        setBlockNewPost(true);
        editor.setEditable(false);

        try {
            // step 2. pass data to be saved in database
            const newPost = editor.getHTML();

            // step 3: upload images and get image urls
            const imgURLs = await processImgUpload(files);

            // step 4: create new post
            await processPostCreation(postTitle, newPost, imgURLs, authorUID, postDbPath);
        } catch (e) {
            console.log(e);
        }

        // step 5. enable new post creation
        editor.commands.clearContent(); // Clear the editor content after saving
        setPostTitle("");
        setPostImgs([]);
        setFiles([]);
        setUploadedImgURLs([]);
        setBlockNewPost(false);
        editor.setEditable(true);
        closeModal();
    };

    return (
        <div className="posts">
            <div className="post-creation">
                <div>
                    <input
                        disabled={blockNewPost}
                        type="text"
                        autoComplete="text"
                        required
                        placeholder="Post Title..."
                        value={postTitle}
                        onChange={(e) => {
                            setPostTitle(e.target.value);
                        }}
                        className="post-input"
                    />
                </div>
                <hr id="post-divider" />
                <MenuBar editor={editor} />
                {editor && <EditorContent editor={editor} />}
                <hr id="post-divider" />
                <span className="img-lbl">Add images...</span>
                <ImageUpload files={files} setFiles={setFiles} setUploadedImgURLs={setUploadedImgURLs} />
                <button className="post-btn" disabled={blockNewPost} onClick={handlePostSave}>
                    {!blockNewPost ? "Post" : "Posting..."}
                </button>
            </div>
        </div>
    );
};
