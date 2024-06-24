"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "@/utils/uploadthing";
import { useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Check, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
  const editName = api.user.updateName.useMutation();
  const utils = api.useUtils();

  const [editing, setEditing] = useState(false);
  const [debounce, setDebounce] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(user.image);
  const [files, setFiles] = useState<File[]>([]);

  const formSchema = z.object({
    full_name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters" })
      .max(100, { message: "Name must not exceed 100 characters." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: userData.full_name,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setEditing(false);

    try {
      
      if (userData.full_name === values.full_name) {
        toast.success("Name updated successfully");
        return;
      }

      const promise = new Promise((resolve, reject) => {
        editName
          .mutateAsync({
            full_name: values.full_name,
            id: userData.id,
          })
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      });

      toast.promise(promise, {
        loading: "Saving...",
        success: "Name updated successfully",
        error: "Failed to update name",
      });

      await utils.user.getUser.invalidate();
    } catch (error) {
      console.log(error);
    }
  }

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
      <div className="relative w-full max-w-md border p-10">
        <Button
          size={"icon"}
          variant={"outline"}
          className="absolute right-5 top-5"
          disabled={!form.formState.isValid}
          onClick={() =>
            setEditing((val) => {
              if (val) {
                form
                  .handleSubmit(onSubmit)()
                  .then(() => {
                    console.log("Success");
                  })
                  .catch((err) => {
                    console.log(err);
                  });

                return false;
              } else {
                return true;
              }
            })
          }
        >
          {editing ? (
            <Check size={18} color="green" />
          ) : (
            <PencilLine size={18} />
          )}
        </Button>
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

          <div className="">
            {editing ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-2 font-bold"
                >
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <h1 className="text-center text-lg font-semibold">
                {form.getValues("full_name")}
              </h1>
            )}
          </div>

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
                setDebounce(false);
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
