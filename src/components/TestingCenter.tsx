"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { EllipsisVertical } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { api, type RouterOutputs } from "@/trpc/react";
import { type CarouselApi } from "@/components/ui/carousel";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TestingCenter = ({
  centersData,
  owner,
}: {
  centersData: RouterOutputs["user"]["getCenters"];
  owner: string;
}) => {
  const { data: centerData } = api.user.getCenters.useQuery(
    {
      owner,
      status: "all",
    },
    {
      initialData: centersData,
    },
  );

  return (
    <div className="mx-auto flex w-full flex-1 flex-col ">
      <div className="sticky top-[5.8rem] z-10 w-full ">
        <div className="flex  h-20 w-full items-center justify-between bg-white px-5 py-4 drop-shadow-md">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link href={`/testing-lab/new`}>
            <Button className="space-x-2 rounded-full bg-blue hover:bg-blue/80">
              <Plus size={18} />
              <h1 className="">Add new </h1>
            </Button>
          </Link>
        </div>
        <Separator />
      </div>

      <div className="grid  w-fit grid-cols-2 gap-4 bg-white p-5 sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
        {centerData.map((item) => (
          <div className="h-auto" key={item.id}>
              <div className="group relative h-fit w-full auto-rows-max auto-cols-min overflow-hidden rounded-lg">
                <ImageSlider
                  imageData={item.images}
                  labId={item.id}
                  deactivated={item.deactivated}
                />
              </div>
            <div className="mt-3">
              <h1 className=" text-sm font-medium sm:text-base">{item.name}</h1>
              <p className="text-xs opacity-70 sm:text-sm">
                {item.location?.barangay}, {item.location?.city}{" "}
                {item.location?.province}
              </p>

              {item.deactivated ? (
                <p className={cn("text-sm capitalize text-red-500", {})}>
                  Deactivated
                </p>
              ) : (
                <p
                  className={cn("text-sm capitalize", {
                    "text-orange-500": item.status === "pending",
                    "text-red-500": item.status === "rejected",
                    "text-green-500": item.status === "accepted",
                  })}
                >
                  {item.status}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ImageType {
  id: number;
  url: string;
  name: string;
  thumbnail: boolean;
  created_at: string;
  testing_center: number;
}

const ImageSlider = ({
  imageData,
  labId,
  deactivated,
}: {
  imageData: ImageType[];
  labId: number;
  deactivated: boolean;
}) => {
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toDeactivate, setToDeactivate] = useState<number | null>(null);
  const utils = api.useUtils();

  const [menuOpen, setMenuOpen] = useState(false);
  const deleteCenterMutation = api.user.deleteCenter.useMutation();
  const changeStatusMutation = api.user.changeCenterStatus.useMutation();
  const [imageLoading, setImageLoading] = useState(true);
  const [cApi, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!cApi) {
      return;
    }

    setCurrent(cApi.selectedScrollSnap() + 1);

    cApi.on("select", () => {
      setCurrent(cApi.selectedScrollSnap() + 1);
    });
  }, [cApi]);

  return (
    <>
      <Carousel setApi={setApi} className="h-full bg-black">
        <CarouselContent className="">
          {imageLoading && (
            <AspectRatio ratio={1 / 1} className=" ">
              <Skeleton className="absolute left-0 top-0 h-64 w-full" />
            </AspectRatio>
          )}
          {imageData.map((image) => {
            if (image.thumbnail) {
              return (
                <CarouselItem className="!h-full " key={image.id}>
                  <AspectRatio ratio={1 / 1} className="w-full !h-full">
                    <Image
                      onLoad={() => {
                        setImageLoading(false);
                      }}
                      src={image.url}
                      width={900}
                      height={900}
                      className="h-full w-full object-cover object-center absolute bottom-0"
                      alt={image.id.toString()}
                    />
                  </AspectRatio>
                </CarouselItem>
              );
            }
          })}

          {imageData.map((image) => {
            if (!image.thumbnail) {
              return (
                <CarouselItem className="" key={image.id}>
                  <AspectRatio ratio={1 / 1} className=" ">
                    <Image
                      src={image.url}
                      width={900}
                      height={900}
                      className="h-full w-full object-cover object-center absolute bottom-0"
                      alt={image.id.toString()}
                    />
                  </AspectRatio>
                </CarouselItem>
              );
            }
          })}
        </CarouselContent>
        <div className="pointer-events-none opacity-0 transition-all duration-100 ease-in-out group-hover:pointer-events-auto group-hover:opacity-100">
          <CarouselPrevious className="absolute left-3 z-10" />
          <CarouselNext className="absolute right-3 z-10" />
        </div>
        <div className="absolute left-0 top-2 flex w-full justify-end  px-3">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger className="rounded-full bg-white px-1 py-1 opacity-50 transition-all duration-300 ease-in-out hover:opacity-100">
              {" "}
              <EllipsisVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/labs/${labId}`}>
                <DropdownMenuItem>View</DropdownMenuItem>
              </Link>
              <Link href={`/testing-lab/edit/${labId}`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => setToDeactivate(labId)}>
                {deactivated ? "Reactivate" : "Deactivate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setToDelete(labId)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-3 left-0 right-0 mx-auto flex w-fit items-center gap-1">
          {Array.from({ length: imageData.length }).map((_, index) => (
            <div
              className={cn(
                "h-[5px] w-[5px] shrink-0 rounded-full bg-white  opacity-50 transition-all duration-300 ease-in-out",
                {
                  "h-2 w-2 opacity-100": index + 1 === current,
                },
              )}
              key={index}
            ></div>
          ))}
        </div>
      </Carousel>

      <Dialog open={toDeactivate !== null}>
        <DialogContent onInteractOutside={() => setToDeactivate(null)}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              {deactivated
                ? "This will reactive your testing lab and will be visible again to users."
                : "This will remove your testing lab into the list of active centers and will not be visible to users until you reactivate it."}
              <div className="mt-4 flex justify-end gap-2  ">
                <Button variant="secondary">Cancel</Button>

                <Button
                  className="hover:bg-blue"
                  onClick={async () => {
                    await changeStatusMutation.mutateAsync({
                      labId,
                      deactivated: !deactivated,
                    });

                    setToDeactivate(null);
                    await utils.user.getCenters.invalidate();
                  }}
                >
                  Confirm
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={toDelete !== null}>
        <DialogContent onInteractOutside={() => setToDelete(null)}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              <div className="mt-4 flex justify-end gap-2  ">
                <Button variant="secondary" onClick={() => setToDelete(null)}>
                  Cancel
                </Button>

                <Button
                  className="hover:bg-blue"
                  onClick={async () => {
                    await deleteCenterMutation.mutateAsync({
                      labId: labId,
                      images: imageData,
                    });

                    setToDelete(null);
                    await utils.user.getCenters.invalidate();
                  }}
                >
                  Confirm
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestingCenter;
