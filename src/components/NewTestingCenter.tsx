/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { cn } from "@/lib/utils";
import { useUploadThing } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "@uploadthing/react";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { z } from "zod";

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
import { api } from "@/trpc/react";
import SelectTime from "./SelectTime";
import { useRouter } from "next/navigation";
import useGetSession from "@/utils/useGetSession";
import { isValidMapLink } from "@/utils/utils";
import type { LocationInterface } from "@/lib/locationTypes";

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

const NewTestingCenter = () => {
  const { session: user } = useGetSession();

  const uploadTestingCenterMutation = api.user.addTestingCenter.useMutation();
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
      name: "",
      region: "Region IV-A (CALABARZON)",
      province: "Cavite",
      city: "",
      barangay: "",
      zip: "",
      landmark: "",
      services: "",
      facebook: "",
      contact: "",
      google_map: null,
    },
  });

  useEffect(() => {
    void (async () => {
      const citiesData = await cities("0421");
      setLocationData((prev) => ({ ...prev, cities: citiesData }));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow relative mx-auto flex w-full flex-1 flex-col">
      <div className="sticky top-[5.8rem] z-10 w-full drop-shadow-md">
        <div className="flex h-20 w-full items-center justify-between bg-white px-5 py-4  ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/testing-lab">Dashboard</BreadcrumbLink>
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
            disabled={!form.formState.isValid || files.length !== 5}
            onClick={form.handleSubmit(async (data) => {
              if (!debounce) {
                setDebounce(true);

                if (
                  data.google_map !== "" &&
                  !isValidMapLink(data.google_map ?? '')
                ) {
                  form.setError("google_map", {
                    message: "Invalid Google Map link",
                  });
                  setDebounce(false)
                  return;
                }

                try {
                  const uploadData =
                    await uploadTestingCenterMutation.mutateAsync({
                      ...data,
                      open_hours: daysValue,
                      ownerId: user?.user.id ?? "",
                    });

                  const postId = uploadData.id;
                  await startUpload(files, {
                    preview: previewImage!,
                    testing_center_id: postId,
                  });
                  form.reset();
                  setImages([]);
                  setFiles([]);

                  router.refresh();
                } catch (error) {
                  console.log(error);
                }
              }

              setDebounce(false);
            })}
          >
            {debounce ? "Submitting..." : "Submit for review"}
          </Button>
        </div>
        <Separator />
      </div>

      <div className="w-ful flex bg-white md:space-x-10 ">
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
                        "group relative mx-auto mt-3 h-36 w-full cursor-pointer bg-gray-100 p-3",
                        {
                          "h-10 p-0": files.length >= 5,
                        },
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center border-4 border-dashed border-black/10 transition-all duration-300 ease-in-out group-hover:border-black/50",
                          {
                            "border-0 ": files.length >= 5,
                          },
                        )}
                      >
                        <input {...getInputProps()} multiple />

                        <div className="flex flex-col items-center space-y-2 opacity-50 transition-all duration-300 ease-in-out group-hover:opacity-100">
                          {files.length > 0 ? (
                            <p className="">Replace images</p>
                          ) : (
                            <>
                              <Upload size={38} />
                              <p className="text-sm">
                                Drag and drop files here
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mx-auto mt-5 w-fit">
                      {files.length >= 5 && (
                        <div className="flex flex-row-reverse gap-2">
                          {images.map((file) => {
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
                                  <div className="sm:text-sn absolute bottom-0 w-full bg-blue/80 py-1 text-center text-[8px] text-white">
                                    Thumbnail
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
                                value={field.value}
                                disabled
                                defaultValue={field.value}
                                key={field.name}
                                onValueChange={async (value) => {
                                  console.log(
                                    "🚀 ~ onValueChange={ ~ value:",
                                    value,
                                  );
                                  form.resetField("province");
                                  form.resetField("city");
                                  form.resetField("barangay");

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
                                value={field.value}
                                defaultValue={field.value}
                                disabled
                                key={field.name}
                                onValueChange={async (value) => {
                                  form.resetField("city");
                                  form.resetField("barangay");

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
                                  form.resetField("barangay");

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
                         Share &gt; Embed a map &gt; COPY HTML
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

export default NewTestingCenter;
