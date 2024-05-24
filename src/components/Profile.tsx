"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "@/utils/uploadthing";
import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const VALID_FILE_TYPES = ["image/png", "image/jpeg"];

const Profile = ({ user }: { user: RouterOutputs["user"]["getUser"] }) => {
  const { data: userData } = api.user.getUser.useQuery(
    {
      userId: user.id,
    },
    {
      initialData: user,
    },
  );
  const [debounce, setDebounce] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(user.image);
  const [files, setFiles] = useState<File[]>([]);
  const utils = api.useUtils();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);

    const file = acceptedFiles[0];
    console.log("🚀 ~ onDrop ~ file:", file);

    if (file && VALID_FILE_TYPES.includes(file.type)) {
      if (imagePath !== null) {
        setImageChanged(true);
      }

      const url = URL.createObjectURL(file);
      setImagePath(url);
    } else {
      toast.error("Invalid file type");
    }
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("profileUploader", {
    onClientUploadComplete: () => {
      toast.success("Image uploaded successfully");
    },
    onUploadError: () => {
      toast.error("Failed to upload image");
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  return (
    <div className="flex flex-1 flex-col items-center pt-24">
      <div className="w-full max-w-md border p-10">
        <div
          {...getRootProps()}
          className="group relative mx-auto h-44 w-44 cursor-pointer overflow-hidden rounded-full bg-gray-500"
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 grid h-full w-full place-content-center bg-black/80 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
            <Camera size={58} color="white" />
          </div>
          {imagePath ? (
            <Image
              src={imagePath}
              alt="User image"
              width={300}
              height={300}
              className="absolute left-0 top-0 h-full w-full object-cover object-center"
            />
          ) : (
            <Image
              src="/no-profile.webp"
              alt="Default Image"
              width={300}
              height={300}
              className="absolute left-0 top-0 h-full w-full object-cover object-center"
            />
          )}
          <input {...getInputProps()} accept="image/png, image/jpeg" />
        </div>

        <div className="mt-4 flex flex-col items-center justify-center">
          <h2 className="text-xs font-medium uppercase">
            {userData.user_role?.replaceAll("_", " ")}
          </h2>
          <h1 className="text-lg font-semibold">{userData.full_name}</h1>
          <h2 className="mt-4 text-xs font-medium uppercase">
            {userData.email}
          </h2>

          <Button
            disabled={files.length === 0}
            className="mt-4 w-full bg-blue hover:bg-blue/70"
            onClick={async () => {
              

              if (!debounce) {
                setDebounce(true);
                await startUpload(files, {
                  userId: userData.id,
                  imageChanged,
                  oldImage: userData.image,
                });

                await utils.user.getUser.invalidate();
                setFiles([]);
                setDebounce(false)
              }
            }}
          >
            {debounce ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
