"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type CarouselApi } from "@/components/ui/carousel";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Database } from "@/lib/types";

const ImageSlider = ({
  imageData,
}: {
  imageData: Database["public"]["Tables"]["images"]["Row"][];
}) => {
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
    </>
  );
};

export default ImageSlider;