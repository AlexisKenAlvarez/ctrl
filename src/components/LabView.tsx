"use client";
import { cn, isLabOpen, toMilitaryTime } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Clock, DoorClosed } from "lucide-react";

import { CircleUserRound } from "lucide-react";

import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Facebook } from "lucide-react";
import { Star } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Textarea } from "./ui/textarea";
import useGetSession from "@/utils/useGetSession";
import { useRouter } from "next/navigation";

const rateStatus = [
  {
    rate: 1,
    label: "Terrible",
  },
  {
    rate: 2,
    label: "Poor",
  },
  {
    rate: 3,
    label: "Fair",
  },
  {
    rate: 4,
    label: "Good",
  },
  {
    rate: 5,
    label: "Amazing",
  },
];

const LabView = ({
  labData,
  labId,
}: {
  labData: RouterOutputs["user"]["getSingleCenter"];
  labId: string;
}) => {
  const [starHover, setStarHover] = useState<number | null>(null);
  const router = useRouter();
  const { session } = useGetSession();
  const [rate, setRate] = useState(0);
  const { data: lab } = api.user.getSingleCenter.useQuery(
    {
      id: labId,
    },
    {
      initialData: labData,
    },
  );

  const addReviewMutation = api.user.addReview.useMutation();

  const formSchema = z.object({
    text: z.string().min(2).max(50),
  });

  type reviewType = z.infer<typeof formSchema>;

  const form = useForm<reviewType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const currentDate = new Date();

  // Get the day of the week in full name format (e.g., "Monday", "Tuesday")
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="w-full">
      {lab.status != "accepted" && (
        <div
          className="mb-4 w-full rounded-lg  p-3 capitalize"
          style={
            lab.status === "pending"
              ? { backgroundColor: "#fee2e2" }
              : lab.status === "rejected"
                ? { backgroundColor: "#f87171", color: "white" }
                : undefined
          }
        >
          <b>Status:</b> {lab.status}
        </div>
      )}
      <div className="flex h-[26rem] w-full gap-2 overflow-hidden rounded-2xl">
        {lab.images.map((image) => {
          if (image.thumbnail) {
            return (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <Image
                    alt={image.name}
                    width={1000}
                    height={1000}
                    src={image.url}
                    className="w-[35rem] cursor-pointer object-cover"
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

        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
          {lab.images.map((image) => {
            if (!image.thumbnail) {
              return (
                <Dialog key={image.id}>
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

      <div className="mt-6 flex">
        <div className="w-1/2 ">
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
                            <p className="">Open hours</p>
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

                const openTIme = toMilitaryTime(data.open_time);
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

          <div className="mt-4 space-y-6">
            <Separator />

            <div className="flex items-center gap-2">
              <div className="h-fit w-fit rounded-full bg-blue">
                <CircleUserRound
                  size={40}
                  strokeWidth={1}
                  color="#ffffff"
                  stroke="white"
                />
              </div>
              <div className="">
                <h1 className="">{lab.owner_data?.full_name}</h1>
                <p className="text-sm opacity-50">Owner</p>
              </div>
            </div>
            <Separator />

            <div className="space-y-1  ">
              <h1 className="text-lg">Services offered</h1>
              <pre className="text-wrap font-sans opacity-70">
                {lab.services}
              </pre>
            </div>

            <Separator />

            <div className="">
              <h1 className="">Reviews</h1>
              {lab.reviews.length === 0 && (
                <p className="text-sm opacity-70">No reviews yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 px-10">
          <div className="w-full rounded-2xl border p-5 text-center">
            <h1 className="text-lg">Get in touch</h1>
            <p className="mx-auto max-w-xs text-sm opacity-70">
              Feel free to reach out to us anytime via our facebook page.
            </p>

            <Button className="mt-4">
              <a
                href={lab.facebook}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-x-2"
              >
                <Facebook size={16} /> <span>Facebook page</span>
              </a>
            </Button>

            <Dialog open={rate !== 0}>
              <DialogTrigger asChild>
                <div className="mx-auto mt-8 flex w-fit items-center justify-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={32}
                      strokeWidth={1}
                      color="#fcd34d"
                      fill={
                        starHover !== null
                          ? index <= starHover
                            ? "#fcd34d"
                            : "none"
                          : "none"
                      }
                      onMouseEnter={() => setStarHover(index)}
                      onMouseLeave={() => setStarHover(null)}
                      onClick={() => {
                        if (!session) {
                          router.push("/auth/signin");
                        } else {
                          setRate(index + 1);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  ))}
                </div>
              </DialogTrigger>
              <DialogContent onInteractOutside={() => setRate(0)}>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={32}
                          strokeWidth={1}
                          color="#fcd34d"
                          fill={index + 1 <= rate ? "#fcd34d" : "none"}
                          onClick={() => setRate(index + 1)}
                          className="cursor-pointer"
                        />
                      ))}
                    </div>
                    {rateStatus.map((status) => {
                      if (status.rate === rate) {
                        return (
                          <p className="opacity-50" key={status.rate}>
                            {status.label}
                          </p>
                        );
                      }
                    })}
                  </div>

                  <DialogTitle>Let us know about your experience</DialogTitle>
                  <DialogDescription>{lab.name}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(async (data) => {
                      await addReviewMutation.mutateAsync({
                        author: session?.user.id ?? "",
                        labId: parseInt(labId),
                        text: data.text,
                        rating: rate,
                      });

                      form.reset();
                      setRate(0);
                    })}
                    className="space-y-3"
                  >
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What can you say?"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogDescription>
                      Your name will be displayed next to your review.
                    </DialogDescription>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!form.formState.isValid}
                    >
                      Submit
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <p className="mt-1 text-sm opacity-70">Leave a rating</p>
          </div>
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
  const [sortedDay, setSortedDay] =
    useState<RouterOutputs["user"]["getSingleCenter"]["open_hour"]>();
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
    setSortedDay(
      hoursData.sort((a, b) => getDayIndex(a.day!) - getDayIndex(b.day!)),
    );
  }, []);

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
