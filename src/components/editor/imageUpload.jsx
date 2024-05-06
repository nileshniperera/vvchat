import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import { useDropzone } from "react-dropzone";

import { useCallback, useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { uid } from "uid";

export const ImageUpload = ({ files, setFiles, setUploadedImgURLs }) => {
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const removeFile = useCallback((fileToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div className="flex gap-4 mt-2">
            {files.map((file, index) => (
                <ImagePreview key={index} file={file} onRemove={removeFile} />
            ))}
            <div className="img-dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="">
                    <p>Drop files...</p>
                    <FaCloudUploadAlt />
                </div>
            </div>
        </div>
    );
};

const ImagePreview = ({ file, onRemove }) => {
    const [src, setSrc] = useState("");

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setSrc(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className="img-preview">
            <img className="" src={src} alt="post" />
            <button className="" onClick={() => onRemove(file)}>
                <MdDelete />
            </button>
            <div className="img-backdrop"></div>
        </div>
    );
};
