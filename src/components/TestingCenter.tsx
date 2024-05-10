"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";

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

          <Link href={`/testing-center/new`}>
            <Button className="space-x-2 rounded-full bg-blue hover:bg-blue/80">
              <Plus size={18} />
              <h1 className="">Add new </h1>
            </Button>
          </Link>
        </div>
        <Separator />
      </div>

      <div className="flex w-full flex-1 flex-wrap  gap-4 bg-white p-5">
        {centerData.map((item) => (
          <div className="h-64 w-64" key={item.id}>
            <div className="group  relative h-64 w-64 overflow-hidden rounded-lg border">
              <ImageSlider imageData={item.images} centerId={item.id} />
            </div>
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
  const [imageLoading, setImageLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        {imageLoading && (
          <Skeleton className="h-64 w-full absolute top-0 left-0" />
        )}
        {imageData.map((image) => {
          if (image.thumbnail) {
            return (
              <CarouselItem className="h-64 w-64" key={image.id}>
                <Image
                  onLoad={() => {
                    setImageLoading(false);
                  }}
                  src={image.url}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center"
                  alt={image.id.toString()}
                />
              </CarouselItem>
            );
          }
        })}

        {imageData.map((image) => {
          if (!image.thumbnail) {
            return (
              <CarouselItem className="h-64 w-64" key={image.id}>
                <Image
                  src={image.url}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center"
                  alt={image.id.toString()}
                />
              </CarouselItem>
            );
          }
        })}
      </CarouselContent>
      <div className="pointer-events-none opacity-0 transition-all duration-100 ease-in-out group-hover:pointer-events-auto group-hover:opacity-100">
        <CarouselPrevious className="absolute left-3 z-10" />
        <CarouselNext className="absolute right-3 z-10" />
      </div>
      <div className="absolute left-0 top-2 flex w-full justify-between px-3">
        <Link href={`/testing-center/edit/${centerId}`}>
          <Button
            className="h-8 w-5 shrink-0 rounded-full opacity-50 hover:opacity-100"
            variant={"secondary"}
          >
            <Pencil size={14} className="absolute" />
          </Button>
        </Link>

        <Button
          className="h-8 w-5 shrink-0 rounded-full opacity-50 hover:opacity-100"
          variant={"secondary"}
        >
          <Trash size={14} color="#ef4444" className="absolute" />
        </Button>
      </div>
      <div className="absolute bottom-3 left-0 right-0 mx-auto flex w-fit items-center gap-1">
        {Array.from({ length: imageData.length }).map((_, index) => (
          <div
            className={cn(
              "h-[5px] w-[5px] shrink-0 rounded-full bg-white  opacity-50",
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
