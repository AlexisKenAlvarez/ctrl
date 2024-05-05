"use client";

import { useUploadThing } from "@/utils/uploadthing";
import { useDropzone } from "@uploadthing/react";
import { useState, useCallback } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";

const NewTestingCenter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      alert("uploaded successfully!");
    },
    onUploadError: () => {
      alert("error occurred while uploading");
    },
    onUploadBegin: () => {
      alert("upload has begun");
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 5,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  return (
    <div className="flex-1 bg-white p-5">
      <h1 className="text-xl">Add new testing center</h1>
      <p className="text-sm opacity-50">
        This testing center will be submitted for review. It might take some
        time before it gets accepted.
      </p>

      <div {...getRootProps()}>
        <input {...getInputProps()} multiple />
        <div>
          {files.length > 0 && (
            <button onClick={() => startUpload(files)}>
              Upload {files.length} files
            </button>
          )}
        </div>
        Drop files here!
      </div>
    </div>
  );
};

export default NewTestingCenter;
