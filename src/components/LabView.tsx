"use client";
import { api, type RouterOutputs } from "@/trpc/react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LabView = ({
  lab,
  labId,
}: {
  lab: RouterOutputs["user"]["getSingleCenter"];
  labId: string;
}) => {
  const { data: labData } = api.user.getSingleCenter.useQuery(
    {
      id: labId,
    },
    {
      initialData: lab,
    },
  );

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-hidden rounded-2xl">
        {labData.images.map((image) => {
          if (image.thumbnail) {
            return (
              <Dialog className="w-full" key={image.id}>
                <DialogTrigger asChild>
                  <Image
                    alt={image.name}
                    width={1000}
                    height={1000}
                    src={image.url}
                    className="w-full cursor-pointer object-cover"
                  />
                </DialogTrigger>
                <DialogContent>
                  <Image
                    alt={image.name}
                    width={1000}
                    height={1000}
                    src={image.url}
                    className="w-full object-cover"
                  />
                </DialogContent>
              </Dialog>
            );
          }
        })}

        <div className="grid w-[55%] grid-cols-2 gap-2">
          {labData.images.map((image) => {
            if (!image.thumbnail) {
              return (
                <Dialog className="w-full h-full" key={image.id}>
                  <DialogTrigger asChild>
                    <Image
                      alt={image.name}
                      width={1000}
                      height={1000}
                      src={image.url}
                      className="w-full h-full cursor-pointer object-cover"
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <Image
                      alt={image.name}
                      width={1000}
                      height={1000}
                      src={image.url}
                      className="w-full h-full object-cover"
                    />
                  </DialogContent>
                </Dialog>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default LabView;
