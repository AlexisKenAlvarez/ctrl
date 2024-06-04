"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { EllipsisVertical, Frown } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

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
} from "@/components/ui/dialog";

import { type CarouselApi } from "@/components/ui/carousel";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const nav = [
  {
    label: "pending",
  },
  {
    label: "accepted",
  },
  {
    label: "rejected",
  },
];

const AdminDashboard = () => {
  const searchParams = useSearchParams();
  const { data: centerData, isPending } = api.user.getCenters.useQuery({
    status:
      (searchParams.get("status") as
        | "pending"
        | "accepted"
        | "rejected"
        | null) ?? "pending",
    owner: null,
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-auto w-full items-center justify-between px-5 sm:flex-row flex-col gap-3">
        <div className="flex">
          {nav.map((items) => (
            <Link
              href={`/admin?${createQueryString("status", items.label)}`}
              key={items.label}
              className={cn(
                "group relative w-fit p-4 transition-all  duration-300 ease-in-out",
                {
                  "bg-orange-500/10": items.label === "pending",
                  "bg-green-500/10": items.label === "accepted",
                  "bg-red-500/10": items.label === "rejected",
                },
              )}
            >
              <h1 className="capitalize">{items.label}</h1>
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 mx-auto h-1 w-0 transition-all duration-300 ease-in-out group-hover:w-full",
                  {
                    "bg-orange-500": items.label === "pending",
                    "bg-green-500": items.label === "accepted",
                    "bg-red-500": items.label === "rejected",
                    "w-full":
                      searchParams.get("status") === items.label ||
                      (!searchParams.get("status") &&
                        items.label === "pending"),
                  },
                )}
              ></div>
            </Link>
          ))}
        </div>
        <Link href={"/admin/accounts"}>
          <Button
            className=" rounded-full hover:bg-blue hover:text-white"
            variant="secondary"
          >
            Manage accounts
          </Button>
        </Link>
      </div>

      {isPending ? (
        <div className="grid  w-full flex-1 grid-cols-2 gap-4 bg-white p-5 sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 20 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <Skeleton className="lg:min-h-40 lg:min-w-40 2xl:min-h-64" />
              <Skeleton className="h-10" />
            </div>
          ))}
        </div>
      ) : centerData?.length === 0 ? (
        <div className="mx-auto grid h-full w-full flex-1 place-content-center text-center opacity-80">
          <Frown className="mx-auto" strokeWidth={0.7} size={44} />
          <h2 className="mt-3">No Results</h2>
        </div>
      ) : (
        <div className="grid  w-full flex-1 grid-cols-2 gap-4 bg-white p-5 sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {centerData?.map((item) => (
            <div className="h-auto" key={item.id}>
              <div className="group relative mt-2 h-fit w-full auto-cols-min auto-rows-max overflow-hidden rounded-lg lg:min-w-40">
                <ImageSlider
                  params={searchParams.get("status")}
                  imageData={item.images}
                  labId={item.id}
                  deactivated={item.deactivated}
                />
              </div>
              <div className="mt-3">
                <h1 className=" text-sm font-medium sm:text-base">
                  {item.name}
                </h1>
                <p className="text-xs opacity-70 sm:text-sm">
                  {item.location?.barangay}, {item.location?.city}{" "}
                  {item.location?.province}
                </p>

                <p className="text-xs opacity-70 sm:text-sm">
                  Author: <b>{item.owner_data?.email}</b>
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
      )}
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
  params,
}: {
  imageData: ImageType[];
  labId: number;
  deactivated: boolean;
  params: string | null;
}) => {
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [toDeactivate, setToDeactivate] = useState<number | null>(null);
  const utils = api.useUtils();

  const [menuOpen, setMenuOpen] = useState(false);
  const deleteCenterMutation = api.user.deleteCenter.useMutation();
  const changeDeactivatedMutation =
    api.user.changeCenterDeactivated.useMutation();
  const [imageLoading, setImageLoading] = useState(true);
  const [cApi, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const changeStatusMutation = api.user.changeCenterStatus.useMutation();

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
                  <AspectRatio ratio={1 / 1} className="!h-full w-full">
                    <Image
                      onLoad={() => {
                        setImageLoading(false);
                      }}
                      src={image.url}
                      width={900}
                      height={900}
                      className="absolute bottom-0 h-full w-full object-cover object-center"
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
                      className="absolute bottom-0 h-full w-full object-cover object-center"
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
        <div className="absolute left-0 top-2 flex w-full justify-end  gap-2 px-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full bg-white px-3 py-1 text-xs opacity-80 transition-all duration-300 ease-in-out hover:opacity-100">
              <h1 className="">Change status</h1>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {nav.map((item) => {
                if (item.label === "pending" && params === null) {
                  return null;
                } else if (item.label !== params) {
                  return (
                    <DropdownMenuItem
                      key={item.label}
                      className="capitalize"
                      onClick={async () => {
                        try {
                          await changeStatusMutation.mutateAsync({
                            labId,
                            status: item.label as
                              | "pending"
                              | "accepted"
                              | "rejected",
                          });
                          await utils.user.getCenters.invalidate();
                          toast.error("Successfuly updated center status.");
                        } catch (error) {
                          console.log(error);
                          toast.error("Something went wrong");
                        }
                      }}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  );
                }
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger className="shirnk-0 flex h-8 w-8 items-center justify-center rounded-full bg-white px-1 py-1 opacity-50 transition-all duration-300 ease-in-out hover:opacity-100">
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
                    await changeDeactivatedMutation.mutateAsync({
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

export default AdminDashboard;
