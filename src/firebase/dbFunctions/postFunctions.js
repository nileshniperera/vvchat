import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";

export const processImgUpload = async (files) => {
    const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `post-images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Handle progress updates here
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error(error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // console.log("File available at", downloadURL);
                        resolve(downloadURL);
                    });
                }
            );
        });
    });

    try {
        const downloadURLs = await Promise.all(uploadPromises);
        return downloadURLs;
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

export const processPostCreation = async (postTitle, newPost, imgUrls, authorUID, postDbPath) => {
    const postCollection = collection(firestore, postDbPath);
    const newPostRef = await addDoc(postCollection, {
        post_author_uid: authorUID,
        post_title: postTitle,
        post_content: newPost,
        post_images: imgUrls || [],
        post_likes: [],
        createdAt: serverTimestamp(),
        post_comments: [],
    });
    return newPostRef.id;
};

export const deletePost = async (postId, postDbPath) => {
    console.log("deleting post");
    console.log("postId", postId);
    console.log("postDbPath", postDbPath);

    try {
        // Create a reference to the document
        const docRef = doc(firestore, postDbPath, postId);

        // Delete the document
        await deleteDoc(docRef);

        console.log("Document deleted successfully");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
};

export const deletePosts = async (userId, posts, postDb) => {
    await Promise.all(
        posts.map(async (post) => {
            let postPath = "feed";

            if (postDb !== "feed") {
                postPath = `guilds/${postDb}/posts`;
            }

            if (post.post_author_uid === userId) {
                await deletePost(post.id, postPath);
                console.log("deleted post: ", post.id);
            }
        })
    );
};
