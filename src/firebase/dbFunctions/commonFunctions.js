import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const processSingleImgUpload = async (file) => {
    const uploadSingleFile = async (file) => {
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
                        console.log("File available at", downloadURL);
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    try {
        // Assuming you want to upload a single file, you don't need Promise.all
        // If you're uploading multiple files, you would need to adjust this part
        const downloadURL = await uploadSingleFile(file);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
