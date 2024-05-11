"use client";
import { cn, isLabOpen, toMilitaryTime } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Clock, DoorClosed } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";

const LabView = ({
  labData,
  labId,
}: {
  labData: RouterOutputs["user"]["getSingleCenter"];
  labId: string;
}) => {
  const { data: lab, isFetched } = api.user.getSingleCenter.useQuery(
    {
      id: labId,
    },
    {
      initialData: labData,
    },
  );

  const currentDate = new Date();

  // Get the day of the week in full name format (e.g., "Monday", "Tuesday")
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="w-full">
      <div className="flex h-[28rem] gap-2 overflow-hidden rounded-2xl">
        {lab.images.map((image) => {
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
          {lab.images.map((image) => {
            if (!image.thumbnail) {
              return (
                <Dialog className="h-full w-full" key={image.id}>
                  <DialogTrigger asChild>
                    <Image
                      alt={image.name}
                      width={1000}
                      height={1000}
                      src={image.url}
                      className="h-full w-full cursor-pointer object-cover"
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <Image
                      alt={image.name}
                      width={1000}
                      height={1000}
                      src={image.url}
                      className="h-full w-full object-cover"
                    />
                  </DialogContent>
                </Dialog>
              );
            }
          })}
        </div>
      </div>

      <div className="mt-6">
        <h1 className="text-xl font-medium">
          {lab.name} in {lab.location?.city}, {lab.location?.province}
        </h1>
        <h2 className="">
          {lab.location?.barangay}, {lab.location?.city}{" "}
          {lab.location?.province} {lab.location?.landmark}
        </h2>

        <div className="mt-2">
          {lab.open_hour.map((data) => {
            if (data.day?.toLowerCase() === dayName.toLowerCase()) {
              if (data.open_time === null) {
              }

              const openTIme = toMilitaryTime(data.open_time!);
              const closeTime = toMilitaryTime(data.close_time!);

              if (isLabOpen(openTIme, closeTime)) {
                return (
                  <div key={data.day} className="flex items-center gap-2">
                    <p className="flex items-center gap-2 text-green-500">
                      <Clock size={16} /> Open
                    </p>
                    <p className="">•</p>
                    <Dialog>
                      <DialogTrigger className="flex items-center gap-2">
                        <>
                          <p className="">Closes {data.close_time}</p>
                          <ChevronDown size={16} />
                        </>
                      </DialogTrigger>
                      <DialogContent>
                        <OpenHoursDialog
                          hoursData={lab.open_hour}
                          dayName={dayName}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center gap-2" key={data.day}>
                    <p className="flex items-center gap-2 text-red-500">
                      <DoorClosed />
                      Closed
                    </p>
                    <p className="">•</p>
                    <Dialog>
                      <DialogTrigger className="flex items-center gap-2">
                        <>
                          <p className="">Opens {data.open_time}</p>
                          <ChevronDown size={16} />
                        </>
                      </DialogTrigger>
                      <DialogContent>
                        <OpenHoursDialog
                          hoursData={lab.open_hour}
                          dayName={dayName}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              }
            }
          })}
        </div>
      </div>
    </div>
  );
};

const OpenHoursDialog = ({
  hoursData,
  dayName,
}: {
  hoursData: RouterOutputs["user"]["getSingleCenter"]["open_hour"];
  dayName: string;
}) => {
  const [sortedDay, setSortedDay] = useState<RouterOutputs["user"]["getSingleCenter"]["open_hour"]>()
  const daysOfWeek: string[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Function to get the index of a day in the daysOfWeek array
  const getDayIndex = (day: string) => daysOfWeek.indexOf(day);

  useEffect(() => {
    setSortedDay(hoursData.sort((a, b) => getDayIndex(a.day!) - getDayIndex(b.day!)))
  }, [])
  

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Open hours</h1>
      <Separator />
      <ul className="space-y-2">
        {sortedDay?.map((data) => (
          <li
            key={data.id}
            className={cn("flex justify-between", {
              "font-semibold":
                data.day?.toLowerCase() === dayName.toLowerCase(),
            })}
          >
            <h1 className="capitalize">{data.day}</h1>

            <div className="flex w-44 items-center gap-1 text-left">
              <p>{data.open_time ?? "Closed"}</p>
              <p>-</p>
              <p>{data.close_time ?? "Closed"}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabView;
