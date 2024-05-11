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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

          <Link href={`/testing-center/new`}>
            <Button className="space-x-2 rounded-full bg-blue hover:bg-blue/80">
              <Plus size={18} />
              <h1 className="">Add new </h1>
            </Button>
          </Link>
        </div>
        <Separator />
      </div>

      <div className="grid  w-fit grid-cols-2 gap-4 bg-white p-5  sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {centerData.map((item) => (
          <div className="h-auto" key={item.id}>
            <AspectRatio ratio={1 / 1}>
              <div className="group relative h-fit w-full auto-rows-max overflow-hidden rounded-lg">
                <ImageSlider imageData={item.images} centerId={item.id} />
              </div>
            </AspectRatio>
            <div className="mt-3">
              <h1 className=" font-medium">{item.name}</h1>
              <p className="text-sm opacity-70">
                {item.location?.barangay}, {item.location?.city}{" "}
                {item.location?.province}
              </p>

              <p
                className={cn("text-sm capitalize", {
                  "text-orange-500": item.status === "pending",
                })}
              >
                {item.status}
              </p>
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
  centerId,
}: {
  imageData: ImageType[];
  centerId: number;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteCenterMutation = api.user.deleteCenter.useMutation();
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
    <Carousel setApi={setApi} className="h-full ">
      <CarouselContent className="">
        {imageLoading && (
          <AspectRatio ratio={1 / 1} className=" ">
            <Skeleton className="absolute left-0 top-0 h-64 w-full" />
          </AspectRatio>
        )}
        {imageData.map((image) => {
          if (image.thumbnail) {
            return (
              <CarouselItem className="h-full" key={image.id}>
                <AspectRatio ratio={1 / 1} className=" ">
                  <Image
                    onLoad={() => {
                      setImageLoading(false);
                    }}
                    src={image.url}
                    width={900}
                    height={900}
                    className="h-full w-full object-cover object-center"
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
              <CarouselItem className="h-64 w-64" key={image.id}>
                <AspectRatio ratio={1 / 1} className=" ">
                  <Image
                    src={image.url}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover object-center"
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
            <Link href={`/testing-center/edit/${centerId}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Deactivate</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
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
  );
};

export default TestingCenter;
