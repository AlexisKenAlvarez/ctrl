/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { cn } from "@/lib/utils";
import { useUploadThing } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "@uploadthing/react";
import { Router, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { set, z } from "zod";
import { useRouter } from "next/navigation";

interface LocationInterface {
  regions: {
    id: number;
    region_code: string;
    psgc_code: string;
    region_name: string;
  }[];
  barangays: {
    brgy_code: string;
    brgy_name: string;
    province_code: string;
    region_code: string;
  }[];
  provinces: {
    province_code: string;
    province_name: string;
    region_code: string;
    psgc_code: string;
  }[];
  cities: {
    city_code: string;
    city_name: string;
    province_code: string;
    desc: string;
  }[];
}

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  barangays,
  cities,
  provinces,
  regionByCode,
  regions,
} from "select-philippines-address";
import { Separator } from "./ui/separator";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";
import { RouterOutputs, api } from "@/trpc/react";
import { supabase } from "supabase/supabaseClient";
import SelectTime from "./SelectTime";

interface DaysType {
  label: string;
  checked: boolean;
  open: string | null;
  close: string | null;
}

interface ImagesType {
  url: string;
  name: string;
}

const EditCenter = ({
  centerData,
  labId,
}: {
  centerData: RouterOutputs["user"]["getSingleCenter"];
  labId: string;
}) => {
  const user = supabase.auth.getSession();
  const router = useRouter();
  const [daysValue, setDaysValue] = useState<DaysType[]>([
    {
      label: "monday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "tuesday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "wednesday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "thursday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "friday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "saturday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "sunday",
      checked: false,
      open: null,
      close: null,
    },
  ]);

  const [ogDaysValue, setOgDaysValue] = useState<DaysType[]>([
    {
      label: "monday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "tuesday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "wednesday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "thursday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "friday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "saturday",
      checked: false,
      open: null,
      close: null,
    },
    {
      label: "sunday",
      checked: false,
      open: null,
      close: null,
    },
  ]);

  const { data: center, isFetched: centerFetched } =
    api.user.getSingleCenter.useQuery(
      {
        id: labId,
      },
      {
        initialData: centerData,
      },
    );

  const editCenterMutation = api.user.updateCenter.useMutation();
  const utils = api.useUtils();
  const [locationData, setLocationData] = useState<LocationInterface>({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  const [page, setPage] = useState<"basic" | "location">("basic");
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ImagesType[]>([]);
  const [debounce, setDebounce] = useState(false);
  const [thumbnail, setThumbnail] = useState("");

  const handleTime = useCallback(
    ({ type, value, day }: { type: string; value: string; day: string }) => {
      setDaysValue((prev) =>
        prev.map((item) => {
          if (item.label === day) {
            return {
              ...item,
              [type]: value,
            };
          }
          return item;
        }),
      );
    },
    [],
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages([]);
    if (acceptedFiles.length === 5) {
      acceptedFiles.forEach((file) => {
        setPreviewImage(null);
        const imageUrl = URL.createObjectURL(file);

        setImages((prev) => [...prev, { url: imageUrl, name: file.name }]);
      });

      setImageError(false);
      setFiles(acceptedFiles);
    } else {
      console.log("You must select 5 images");
      setImageError(true);
    }
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      console.log("Upload Success");
    },
    onUploadError: () => {
      console.log("Upload Error");
    },
    onUploadBegin: () => {
      console.log("Upload begin");
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 6,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  const formSchema = z.object({
    name: z.string().min(1),
    province: z.string().min(1),
    city: z.string().min(1),
    region: z.string().min(1),
    barangay: z.string().min(1),
    zip: z.string().max(4).min(4),
    landmark: z.string().min(1),
    services: z.string().min(5),
    facebook: z.string().url(),
    contact: z.string().min(1).max(11),
    google_map: z.string().nullish(),
  });

  type formType = z.infer<typeof formSchema>;

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: center.name,
      region: center.location?.region,
      province: center.location?.province,
      city: center.location?.city,
      barangay: center.location?.barangay,
      zip: center.location?.zip.toString(),
      landmark: center.location?.landmark,
      services: center.services,
      facebook: center.facebook,
      contact: center.contact.toString(),
      google_map: center.google_map,
    },
  });

  useEffect(() => {
    void (async () => {
      const regionData = await regions();

      const regionCode = regionData.find(
        (data: { region_name: string }) =>
          data.region_name === center.location?.region,
      ).region_code;
      const provinceData = await provinces(regionCode);

      const provinceCode = await provinceData.find(
        (data: { province_name: string }) =>
          data.province_name === center.location?.province,
      ).province_code;

      const cityData = await cities(provinceCode);
      const cityCode = cityData.find(
        (data: { city_name: string }) =>
          data.city_name === center.location?.city,
      ).city_code;

      const barangayData = await barangays(cityCode);

      setLocationData((prev) => ({
        ...prev,
        barangays: barangayData,
        cities: cityData,
        provinces: provinceData,
        regions: regionData,
      }));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDaysValue((val) =>
      val.map((item) => {
        const dayHour = center.open_hour.find(
          (hour) => hour.day === item.label,
        );
        if (dayHour && dayHour.open_time !== null) {
          return {
            ...item,
            checked: true,
            open: dayHour.open_time,
            close: dayHour.close_time,
          };
        } else {
          return {
            ...item,
            checked: false,
            open: null,
            close: null,
          };
        }
      }),
    );

    setOgDaysValue((val) =>
      val.map((item) => {
        const dayHour = center.open_hour.find(
          (hour) => hour.day === item.label,
        );
        if (dayHour && dayHour.open_time !== null) {
          return {
            ...item,
            checked: true,
            open: dayHour.open_time,
            close: dayHour.close_time,
          };
        } else {
          return {
            ...item,
            checked: false,
            open: null,
            close: null,
          };
        }
      }),
    );
  }, [centerFetched, center.open_hour]);

  return (
    <div className="overflow relative mx-auto flex w-full flex-1 flex-col">
      <div className="sticky top-[5.8rem] z-10 w-full drop-shadow-md">
        <div className="flex h-20 w-full items-center justify-between bg-white px-5 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/testing-lab">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add new center</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button
            className={cn(
              "w-fu pointer-events-auto rounded-full hover:bg-blue",
              {
                "pointer-events-none": debounce,
              },
            )}
            disabled={!form.formState.isValid}
            onClick={form.handleSubmit(async (values) => {
              console.log("Old hour", ogDaysValue);
              console.log("New hour", daysValue);
              setDebounce(true);
              try {
                await editCenterMutation.mutateAsync({
                  labId: labId,
                  oldValues: {
                    name: center.name,
                    province: center.location!.province,
                    city: center.location!.city,
                    region: center.location!.region,
                    barangay: center.location!.barangay,
                    zip: center.location!.zip.toString(),
                    landmark: center.location!.landmark,
                    services: center.services,
                    facebook: center.facebook,
                    contact: center.contact.toString(),
                    google_map: center.google_map,
                  },
                  old_thumbnail: center.images.find((img) => img.thumbnail)!
                    .name,
                  old_open_hours: ogDaysValue,
                  newValues: {
                    ...values,
                  },
                  new_open_hours: daysValue,
                  new_thumbnail: thumbnail,
                  thumbnailChanged: thumbnail !== "",
                  imageChanged: previewImage !== null,
                  images: center.images,
                });

                if (previewImage !== null) {
                  await startUpload(files, {
                    preview: previewImage,
                    testing_center_id: parseInt(labId),
                  });
                }

                form.setValue("name", values.name);
                form.setValue("region", values.region);
                form.setValue("province", values.province);
                form.setValue("city", values.city);
                form.setValue("barangay", values.barangay);
                form.setValue("zip", values.zip);
                form.setValue("landmark", values.landmark);
                form.setValue("services", values.services);
                form.setValue("facebook", values.facebook);
                form.setValue("contact", values.contact);
                form.setValue("google_map", values.google_map);

                window.location.href = "/testing-lab";
                console.log("Edit success");
                await utils.user.getCenters.invalidate();
              } catch (error) {
                console.log(error);
              }
              setDebounce(false);
            })}
          >
            {debounce ? "Saving..." : "Save changes"}
          </Button>
        </div>
        <Separator />
      </div>

      <div className="w-ful flex bg-white md:space-x-10">
        <div className=" hidden w-56 border-r py-12 md:block">
          <h1 className="px-7">Information</h1>
          <ul className="mt-2 text-sm">
            {INFORMATION_NAV.map((items) => (
              <button
                key={items.href}
                className={cn(
                  "w-full px-12 py-3 text-left transition-all duration-100 ease-in-out hover:bg-slate-100 hover:text-blue",
                  {
                    "text-blue": page === items.href,
                  },
                )}
                onClick={() => setPage(items.href as "basic" | "location")}
              >
                <li>{items.name}</li>
              </button>
            ))}
          </ul>
        </div>

        <div className="flex w-fit max-w-2xl flex-col justify-center p-5 md:p-12">
          <h1 className="text-xl">Add new testing center</h1>
          <p className="max-w-prose text-left text-sm opacity-50">
            This testing center will be submitted for review. It might take some
            time before it gets accepted.
          </p>

          <div className="mt-10 w-full text-left">
            <Form {...form}>
              <form className="">
                <div
                  className={cn("space-y-6", {
                    hidden: page !== "basic",
                  })}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testing center name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Testing center"
                            className=""
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What do you offer?"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IMAGES */}
                  <div className="">
                    <h1 className="">Upload Images</h1>
                    <p
                      className={cn("text-sm opacity-50", {
                        "text-red-500 opacity-100": imageError,
                      })}
                    >
                      You must select 5 images
                    </p>
                    <div
                      {...getRootProps()}
                      className={cn(
                        "group relative mx-auto mt-3 h-10 w-full cursor-pointer bg-gray-100 p-0",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center border-0 border-dashed border-black/10 transition-all duration-300 ease-in-out group-hover:border-black/50 ",
                        )}
                      >
                        <input {...getInputProps()} multiple />

                        <div className="flex flex-col items-center space-y-2 opacity-50 transition-all duration-300 ease-in-out group-hover:opacity-100">
                          <p className="">Replace images</p>
                        </div>
                      </div>
                    </div>

                    <div className="mx-auto mt-5 w-fit">
                      <div className="flex flex-row-reverse gap-2">
                        {files.length !== 5 &&
                          center.images.map((file) => {
                            return (
                              <button
                                key={file.name}
                                onClick={(e) => {
                                  e.preventDefault();

                                  if (!file.thumbnail) {
                                    setThumbnail(file.name);
                                  } else {
                                    setThumbnail("");
                                  }
                                }}
                                className="relative"
                              >
                                <Image
                                  src={file.url}
                                  alt={file.name}
                                  width={500}
                                  height={500}
                                  className={cn(
                                    "block h-16 w-16 border-2 border-black/10 object-cover sm:h-28 sm:w-28",
                                    {
                                      "border-2 border-blue":
                                        file.thumbnail && thumbnail === "",
                                    },
                                    {
                                      "p border-2 border-blue":
                                        file.name === thumbnail,
                                    },
                                  )}
                                />

                                {file.thumbnail && thumbnail === "" && (
                                  <div className="absolute bottom-0 w-full bg-blue/80 py-1 text-center text-[8px] text-white sm:text-sm">
                                    Thumbnail
                                  </div>
                                )}

                                {file.name === thumbnail && (
                                  <div className="absolute bottom-0 w-full bg-blue/80 py-1 text-center text-[8px] text-white sm:text-sm">
                                    Thumbnail
                                  </div>
                                )}
                              </button>
                            );
                          })}

                        {files.length === 5 &&
                          images.map((file) => {
                            if (previewImage === null) {
                              setPreviewImage(file.name);
                            }

                            return (
                              <button
                                key={file.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPreviewImage(file.name);
                                }}
                                className="relative"
                              >
                                <Image
                                  src={file.url}
                                  alt={file.name}
                                  width={500}
                                  height={500}
                                  className={cn(
                                    "block h-16 w-16 border-2 border-black/10 object-cover sm:h-28 sm:w-28",
                                    {
                                      "border-2 border-blue":
                                        previewImage === file.name,
                                    },
                                  )}
                                />

                                {file.name === previewImage && (
                                  <div className="absolute bottom-0 w-full bg-blue/80 py-1 text-center text-[8px] text-white sm:text-sm">
                                    Thumbnail
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook link</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://www.facebook.com/ctrl/"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will serve as your official page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="mb-3">
                      <h1 className="">Open hours</h1>
                      <p className="text-sm opacity-50">
                        Unchecked days will be automatically marked as closed.
                      </p>
                    </div>

                    {daysValue.map((item) => (
                      <div key={item.label} className="w-full">
                        <div className="flex gap-2">
                          <div className="flex w-full items-center gap-2">
                            <h1 className="flex w-full items-center gap-2 capitalize">
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={(e) => {
                                  if (e) {
                                    setDaysValue((prev) =>
                                      prev.map((day) => {
                                        if (day.label === item.label) {
                                          return {
                                            ...day,
                                            checked: true,
                                            open: "8 AM",
                                            close: "5 PM",
                                          };
                                        }
                                        return day;
                                      }),
                                    );
                                  } else {
                                    setDaysValue((prev) =>
                                      prev.map((day) => {
                                        if (day.label === item.label) {
                                          return {
                                            ...day,
                                            checked: false,
                                            open: null,
                                            close: null,
                                          };
                                        }
                                        return day;
                                      }),
                                    );
                                  }
                                }}
                              />
                              <p
                                className={cn("", {
                                  "opacity-40": !item.checked,
                                })}
                              >
                                {item.label}
                              </p>
                            </h1>

                            <SelectTime
                              day={item.label}
                              value={item.open}
                              type="open"
                              disabled={!item.checked}
                              handleTime={handleTime}
                              oppositeValue={item.close}
                            />
                            <SelectTime
                              day={item.label}
                              value={item.close}
                              type="close"
                              disabled={!item.checked}
                              handleTime={handleTime}
                              oppositeValue={item.open}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={cn("mt-10 space-y-6 md:mt-0", {
                    "md:hidden": page !== "location",
                  })}
                >
                  <div className="">
                    <p className="text-sm opacity-50">
                      Location of the testing center
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                              <Select
                                value=""
                                defaultValue=""
                                key={field.name}
                                onValueChange={async (value) => {
                                  form.setValue("province", "");
                                  form.setValue("city", "");
                                  form.setValue("barangay", "");

                                  setLocationData((prev) => ({
                                    ...prev,
                                    provinces: [],
                                    cities: [],
                                    barangays: [],
                                  }));

                                  const { region_name } =
                                    await regionByCode(value);

                                  field.onChange(region_name);
                                  const provinceData = await provinces(value);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    provinces: provinceData,
                                  }));
                                }}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue
                                    className=""
                                    defaultValue={field.value}
                                  />
                                  <p className="w-full text-left">
                                    {field.value}
                                  </p>
                                </SelectTrigger>
                                <SelectContent>
                                  {locationData.regions.map((region) => (
                                    <SelectItem
                                      value={region.region_code.toString()}
                                      key={region.id}
                                    >
                                      {region.region_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Province</FormLabel>
                            <FormControl>
                              <Select
                                value=""
                                defaultValue=""
                                key={field.name}
                                onValueChange={async (value) => {
                                  form.setValue("city", "");
                                  form.setValue("barangay", "");

                                  console.log(field.value);
                                  setLocationData((prev) => ({
                                    ...prev,
                                    cities: [],
                                    barangays: [],
                                  }));

                                  const provinceName =
                                    locationData.provinces.find((val) => {
                                      return val.province_code === value;
                                    })?.province_name;

                                  field.onChange(provinceName);

                                  const cityData = await cities(value);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    cities: cityData,
                                  }));
                                }}
                              >
                                <SelectTrigger className="">
                                  <SelectValue
                                    className=""
                                    defaultValue={field.value}
                                  />
                                  <p className="w-full text-left">
                                    {field.value}
                                  </p>
                                </SelectTrigger>
                                <SelectContent>
                                  {locationData.provinces.map((province) => {
                                    const currentDate = new Date();
                                    const key =
                                      province.province_code +
                                      currentDate.toString();
                                    return (
                                      <SelectItem
                                        value={province.province_code.toString()}
                                        key={key}
                                      >
                                        {province.province_name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>City / Municipality</FormLabel>
                            <FormControl>
                              <Select
                                value=""
                                onValueChange={async (value) => {
                                  form.setValue("barangay", "");

                                  const cityName = locationData.cities.find(
                                    (val) => {
                                      return val.city_code === value;
                                    },
                                  )?.city_name;

                                  field.onChange(cityName);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    barangays: [],
                                  }));

                                  const barangayData = await barangays(value);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    barangays: barangayData,
                                  }));
                                }}
                              >
                                <SelectTrigger className="">
                                  <SelectValue
                                    className=""
                                    defaultValue={field.value}
                                  />
                                  <p className="w-full text-left">
                                    {field.value}
                                  </p>
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.cities.map((city) => (
                                    <SelectItem
                                      value={city.city_code}
                                      key={city.city_code}
                                    >
                                      {city.city_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Barangay</FormLabel>
                            <FormControl>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  const brgyName = locationData.barangays.find(
                                    (val) => {
                                      return val.brgy_code === value;
                                    },
                                  )?.brgy_name;

                                  field.onChange(brgyName);
                                }}
                              >
                                <SelectTrigger className="">
                                  <SelectValue
                                    className=""
                                    defaultValue={field.value}
                                  />
                                  <p className="w-full text-left">
                                    {field.value}
                                  </p>
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.barangays.map((barangay) => (
                                    <SelectItem
                                      value={barangay.brgy_code}
                                      key={barangay.brgy_code}
                                    >
                                      {barangay.brgy_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                maxLength={4}
                                placeholder="0000"
                                onInput={(e) =>
                                  (e.currentTarget.value =
                                    e.currentTarget.value.slice(0, 4))
                                }
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                maxLength={11}
                                minLength={11}
                                placeholder="0000"
                                onInput={(e) =>
                                  (e.currentTarget.value =
                                    e.currentTarget.value.slice(0, 11))
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              11 digit mobile number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark</FormLabel>
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nearest landmark within the area
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="google_map"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Map Link</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Optional"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          This will help users find your location.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

const INFORMATION_NAV = [
  {
    name: "Basic Information",
    href: "basic",
  },
  {
    name: "Location",
    href: "location",
  },
];

export default EditCenter;
