import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export const SingleImageUpload = ({ file, setFile }) => {
    const onDrop = useCallback((acceptedFiles) => {
        // Accept only the first file
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const removeFile = useCallback(() => {
        setFile(null);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: "image/*", maxFiles: 1 });

    return (
        <div className="flex gap-4 mt-2">
            {file && (
                <div className="img-preview">
                    <img src={URL.createObjectURL(file)} alt="Uploaded" />
                    <button onClick={removeFile}>
                        <MdDelete />
                    </button>
                </div>
            )}
            {!file && (
                <div className="img-dropzone" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className="">
                        <p>Drop Image</p>
                        <FaCloudUploadAlt />
                    </div>
                </div>
            )}
        </div>
    );
};
