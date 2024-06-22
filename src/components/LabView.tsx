"use client";
import { cn, isLabOpen, timeAgo, toMilitaryTime } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import { ChevronDown, Clock, DoorClosed, Mail, Phone } from "lucide-react";
import Image from "next/image";

import { Facebook, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

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
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import useGetSession from "@/utils/useGetSession";
import { extractSrcUrl } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageSlider from "./ImageSlider";
import { Textarea } from "./ui/textarea";

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
  reviewsData,
}: {
  labData: RouterOutputs["user"]["getSingleCenter"];
  labId: string;
  reviewsData: RouterOutputs["user"]["getReviews"];
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

  const { data: reviews } = api.user.getReviews.useQuery(
    {
      labId: parseInt(labId),
    },
    {
      initialData: reviewsData,
    },
  );

  const addReviewMutation = api.user.addReview.useMutation({
    onError(error) {
      if (error.data?.code === "CONFLICT") {
        toast.error("You can only review once per lab.");
      }
    },
  });
  const utils = api.useUtils();

  const formSchema = z.object({
    text: z.string().min(2).max(100),
  });

  type reviewType = z.infer<typeof formSchema>;

  const form = useForm<reviewType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const currentDate = new Date();

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const isAuthor = lab.owner === session?.user.id;

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
      {lab.deactivated && (
        <div
          className="mb-4 w-full rounded-lg  p-3 capitalize"
          style={{ backgroundColor: "#f87171", color: "white" }}
        >
          <b>Status:</b> Deactivated
        </div>
      )}
      <div className="hidden h-[26rem] w-full gap-2 overflow-hidden rounded-2xl md:flex">
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
                <DialogContent className="!max-w-3xl w-full">
                    <Image
                      alt={image.name}
                      width={1500}
                      height={1500}
                      src={image.url}
                      className="h-full w-full object-cover"
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
                  <DialogContent className="!max-w-3xl w-full">
                    <Image
                      alt={image.name}
                      width={1500}
                      height={1500}
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

      <div className="block w-full overflow-hidden rounded-2xl md:hidden">
        <ImageSlider imageData={lab.images} />
      </div>

      <div className="w-full gap-2 overflow-hidden rounded-2xl"></div>

      <div className="mt-6 flex flex-col gap-y-5 lg:flex-row">
        <div className="lg:w-1/2 ">
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
              <div className="relative h-11 w-11 overflow-hidden rounded-full">
                {lab.owner_data?.image ? (
                  <Image
                    src={lab.owner_data?.image}
                    alt="user image"
                    width={300}
                    height={300}
                    className="absolute bottom-0 left-0 top-0 my-auto object-cover object-center"
                  />
                ) : (
                  <Image
                    src={"/no-profile.webp"}
                    alt="user image"
                    width={300}
                    height={300}
                    className="absolute left-0 top-0 object-cover object-center"
                  />
                )}
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
          </div>
        </div>

        <div className="lg:w-1/2 lg:px-10">
          <div className="w-full rounded-2xl border p-5 text-center">
            <h1 className="text-lg">Get in touch</h1>
            <p className="mx-auto max-w-xs text-sm opacity-70">
              Feel free to reach out to us anytime.
            </p>

            <div className="mx-auto mt-4 flex max-w-72 flex-col gap-2">
              <Button className=" bg-blue hover:bg-blue/90">
                <a
                  href={lab.facebook}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center gap-x-2"
                >
                  <Facebook size={16} /> <span>Facebook page</span>
                </a>
              </Button>

              <div className="flex gap-2">
                <Button className=" flex w-1/2 items-center gap-x-2 bg-blue hover:bg-blue/90">
                  <Phone size={16} /> <span>{lab.contact}</span>
                </Button>
                <Button className=" w-1/2 bg-blue hover:bg-blue/90">
                  <a
                    href={`mailto:${lab.owner_data?.email}`}
                    rel="noopener noreferrer"
                    className="flex items-center gap-x-2"
                  >
                    <Mail size={16} /> <span>Email</span>
                  </a>
                </Button>
              </div>
            </div>

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
                        } else if (isAuthor) {
                          toast.error("You can't rate your own lab");
                        } else if (lab.status !== "accepted") {
                          toast.error(
                            "You can't rate a lab that is not accepted",
                          );
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
                      try {
                        await addReviewMutation.mutateAsync({
                          author: session?.user.id ?? "",
                          labId: parseInt(labId),
                          text: data.text,
                          rating: rate,
                        });

                        await utils.user.getSingleCenter.invalidate();
                        toast.success("Review added successfully");
                        form.reset();
                        setRate(0);
                      } catch (error) {
                        console.log(error);
                      }
                    })}
                    className="space-y-3"
                  >
                    <div className="">
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

                      <Progress
                        className="mt-2 h-1"
                        value={form.watch("text").length}
                        max={100}
                        indicatorStyle={cn("", {
                          "bg-red-500": form.watch("text").length > 100,
                          "bg-blue": form.watch("text").length <= 100,
                        })}
                      />
                    </div>

                    <DialogDescription>
                      Your name will be displayed next to your review.
                    </DialogDescription>
                    <Button
                      type="submit"
                      className="w-full bg-blue hover:bg-blue/70"
                      disabled={
                        !form.formState.isValid || addReviewMutation.isPending
                      }
                    >
                      {addReviewMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <p className="mt-1 text-sm opacity-70">Leave a rating</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Separator />
        {reviews.data.length === 0 ? (
          <>
            <h1 className="mt-5 text-lg">Reviews</h1>
            <p className="text-sm opacity-70">No reviews yet</p>
          </>
        ) : (
          <div className="mt-6 space-y-4 pb-10">
            <div className="flex w-full flex-col justify-between gap-2 bg-yellow/5 p-4 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium">
                  {reviews.total_rating.average.toFixed(1)}
                </h1>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => {
                    return (
                      <Star
                        key={index}
                        size={24}
                        strokeWidth={1}
                        color="#fcd34d"
                        fill={
                          index < Math.floor(reviews.total_rating.average)
                            ? "#fcd34d"
                            : "none"
                        }
                      />
                    );
                  })}
                </div>
                <h3 className="text-sm opacity-50">
                  {reviews.total_rating.count} reviews
                </h3>
              </div>
              <AllReviews
                labId={labId}
                average={reviews.total_rating.average}
                total={reviews.total_rating.count}
              />
            </div>

            <h1 className="text-lg">Reviews</h1>
            <div className="">
              <div className="grid gap-4 gap-y-6 sm:grid-cols-2">
                {reviews.data.map((review) => (
                  <div className="" key={review.id}>
                    <div className="flex items-start gap-2">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                        {review.author_data?.image ? (
                          <Image
                            src={review.author_data?.image}
                            alt="User image"
                            width={300}
                            height={300}
                            className="absolute bottom-0 left-0 top-0 my-auto object-cover object-center"
                          />
                        ) : (
                          <Image
                            src={"/no-profile.webp"}
                            alt="User image"
                            width={300}
                            height={300}
                            className="absolute bottom-0 left-0 top-0 my-auto object-cover object-center"
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-0">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              strokeWidth={1}
                              color="#fcd34d"
                              fill={index < review.rating ? "#fcd34d" : "none"}
                            />
                          ))}
                        </div>
                        <h1 className="text-sm">
                          {review.author_data?.full_name}
                        </h1>
                        <p
                          className="text-xs opacity-70"
                          suppressHydrationWarning
                        >
                          {timeAgo(review.created_at)}
                        </p>

                        <div className="">
                          <pre className="text-wrap font-sans text-sm">
                            {review.text}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {lab.google_map && (
        <div className="mb-14 mt-6 h-96 w-full space-y-3">
          <Separator />
          <h1 className="text-lg">Where you&apos;ll be</h1>
          <iframe
            onError={(e) => {
              console.log("Error", e);
            }}
            src={extractSrcUrl(lab.google_map ?? "") ?? ""}
            className="h-full w-full"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
    </div>
  );
};

const AllReviews = ({
  labId,
  average,
  total,
}: {
  labId: string;
  average: number;
  total: number;
}) => {
  const { data: reviews } = api.user.getAllReviews.useQuery({
    labId: parseInt(labId),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-fit">
          See all reviews
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80svh] overflow-y-scroll !p-0">
        <DialogHeader className="space-y-0">
          <div className="sticky left-0 top-0 z-10 bg-white p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle>Overall rating</DialogTitle>
                {rateStatus.map((status) => {
                  if (status.rate === Math.floor(average)) {
                    return (
                      <p className="opacity-50" key={status.rate}>
                        - {status.label}
                      </p>
                    );
                  }
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={32}
                      strokeWidth={1}
                      color="#fcd34d"
                      fill={index + 1 <= average ? "#fcd34d" : "none"}
                    />
                  ))}
                </div>
                <h3 className="text-sm opacity-50">{total} reviews</h3>
              </div>
            </div>
            <Separator className="!mt-4" />
          </div>

          <div className="grid gap-4 gap-y-6 p-5 pb-7">
            {reviews?.map((review) => (
              <div className="" key={review.id}>
                <div className="flex items-start gap-2">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    {review.author_data?.image ? (
                      <Image
                        src={review.author_data?.image}
                        alt="User image"
                        width={300}
                        height={300}
                        className="absolute bottom-0 left-0 top-0 my-auto object-cover object-center"
                      />
                    ) : (
                      <Image
                        src={"/no-profile.webp"}
                        alt="User image"
                        width={300}
                        height={300}
                        className="absolute bottom-0 left-0 top-0 my-auto object-cover object-center"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-0">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          strokeWidth={1}
                          color="#fcd34d"
                          fill={index < review.rating ? "#fcd34d" : "none"}
                        />
                      ))}
                    </div>
                    <h1 className="text-left text-sm">
                      {review.author_data?.full_name}
                    </h1>
                    <p className="text-left text-xs opacity-70">
                      {timeAgo(review.created_at)}
                    </p>

                    <div className="">
                      <pre className="text-wrap text-left font-sans text-sm">
                        {review.text}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
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
