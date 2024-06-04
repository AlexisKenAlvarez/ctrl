"use client";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type CarouselApi } from "@/components/ui/carousel";
import { api } from "@/trpc/react";
import { Frown, MapPin, ArrowBigRightDash } from "lucide-react";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { citiesData } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDraggable } from "react-use-draggable-scroll";

interface filterType {
  type: "top-rated" | "oldest" | "newest" | null;
}

const Hero = () => {
  const searchParams = useSearchParams();
  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);
  const { data: centerData, isPending: dataPending } =
    api.user.getHeroCenters.useQuery({
      search: searchParams.get("search") ?? null,
      status: "accepted",
      filter: (searchParams.get("filter") as filterType["type"]) ?? null,
    });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );
  const router = useRouter();

  const filterBy = [
    {
      label: "Top rated",
      link: "top-rated",
    },
    {
      label: "Oldest first",
      link: "oldest",
    },
    {
      label: "Newest first",
      link: "newest",
    },
  ];

  const handleScroll = (direction: "left" | "right") => {
    ref.current.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-5 pb-5">
      <div className="flex w-full items-center gap-6">
        <Button
          variant="outline"
          onClick={() => handleScroll("left")}
          className="hidden h-8 w-8 shrink-0 rotate-180 rounded-full p-0 md:flex"
        >
          <ArrowBigRightDash size={17} />
        </Button>
        <div
          className="scroll-container flex h-fit w-full items-start gap-5 overflow-x-scroll pt-10 md:gap-10"
          {...events}
          ref={ref}
        >
          {citiesData.map((city) => (
            <button
              onClick={() => {
                if (searchParams.get("search") === city.city_name) {
                  router.push("/");
                } else {
                  router.push(`/?${createQueryString("search", city.city_name)}`);
                }
              }}
              key={city.city_name}
              className=" flex items-center justify-center text-center text-sm"
            >
              <div className="group flex select-none flex-col items-center gap-1 opacity-90">
                <MapPin strokeWidth={1} />
                <h1 className="text-xs">{city.label}</h1>
                <div
                  className={cn(
                    " h-1 w-0 rounded-full bg-blue transition-all duration-300 ease-in-out group-hover:w-full",
                    {
                      "w-full": searchParams.get("search") === city.city_name,
                    },
                  )}
                ></div>
              </div>
            </button>
          ))}
        </div>
        <Button
          variant={"outline"}
          onClick={() => handleScroll("right")}
          className="hidden h-8 w-8 shrink-0 rounded-full p-0 md:flex"
        >
          <ArrowBigRightDash size={17} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2" asChild>
            <Button
              className="h-10 w-10 shrink-0 rounded-full p-0 hover:bg-blue/90 hover:text-white md:h-0 md:w-auto md:px-6 md:py-6"
              variant={"secondary"}
            >
              <SlidersHorizontal size={16} />
              <h1 className="hidden md:block">Filter</h1>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterBy.map((item) => (
              <DropdownMenuItem key={item.label} className="p-3" asChild>
                <Link href={`/?${createQueryString("filter", item.link)}`}>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {dataPending ? (
        <div className="mt-14 grid w-full grid-cols-2 items-start  gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 ">
          {Array.from({ length: 20 }).map((_, index) => (
            <div className="space-y-2" key={index}>
              <Skeleton className="lg:min-h-40 lg:min-w-40 2xl:min-h-64" />
              <Skeleton className="h-10" />
            </div>
          ))}
        </div>
      ) : centerData && centerData.length > 0 ? (
        <div className="mt-14 grid w-full grid-cols-2 items-start  gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {centerData.map((item) => (
            <div
              className="h-auto pt-0 cursor-pointer"
              key={item.id}
              onClick={() => router.push(`/labs/${item.id}`)}
            >
              <div className="group relative h-fit auto-cols-min auto-rows-max overflow-hidden rounded-lg lg:min-w-40">
                <ImageSlider imageData={item.images} />
              </div>
              <div className="mt-3">
                <h1 className=" text-left text-sm font-medium sm:text-base">
                  {item.name}
                </h1>
                <p className="text-left text-xs opacity-70 sm:text-sm">
                  {item.location?.barangay}, {item.location?.city}{" "}
                  {item.location?.province}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-full w-full flex-1 place-content-center text-center opacity-80">
          <Frown className="mx-auto" strokeWidth={0.7} size={44} />
          <h2 className="mt-3">No Results</h2>
          <p className="text-sm">Try searching for another location.</p>
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

const ImageSlider = ({ imageData }: { imageData: ImageType[] }) => {
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

export default Hero;
