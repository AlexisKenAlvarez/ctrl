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
  provincesByCode,
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
import SelectTime from "./SelectTime";
import LocationForm from "./LocationForm";

interface DaysType {
  label: string;
  checked: boolean;
  open: string | null;
  close: string | null;
}

const NewTestingCenter = () => {
  const [locationData, setLocationData] = useState<LocationInterface>({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  const [page, setPage] = useState<"basic" | "location">("basic");
  const [files, setFiles] = useState<File[]>([]);
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
  const [previewImage, setPreviewImage] = useState("");

  const [imageError, setImageError] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 5) {
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

  // await startUpload(files, { name: "image" })

  const formSchema = z.object({
    name: z.string().min(1),
    province: z.string().min(1),
    city: z.string().min(1),
    region: z.string().min(1),
    barangay: z.string().min(1),
    zip: z
      .number()
      .int()
      .gte(1000, { message: "Must be 4 digits" })
      .lte(9999, { message: "Must be 4 digits" }),
    landmark: z.string().min(1),
    services: z.string().min(5),
    facebook: z.string().url(),
    contact: z.number().min(1),
    google_map: z.string().url().nullish(),
  });

  type formType = z.infer<typeof formSchema>;

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      zip: 0,
      landmark: "",
      services: "",
      facebook: "",
      contact: 0,
      google_map: "",
    },
  });

  useEffect(() => {
    void (async () => {
      const regionData = await regions();
      setLocationData((prev) => ({ ...prev, regions: regionData }));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow relative mx-auto flex w-full flex-1 flex-col">
      <div className="sticky top-[5.8rem] z-10 w-full drop-shadow-md">
        <div className="flex h-20 w-full items-center justify-between bg-white px-5 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/testing-center">
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
            className="w-fu rounded-full hover:bg-blue"
            disabled={!form.formState.isValid}
            onClick={form.handleSubmit((data) => {
              console.log(data);
            })}
          >
            Submit for review
          </Button>
        </div>
        <Separator />
      </div>

      <div className="w-ful flex space-x-10 bg-white">
        <div className=" w-56 border-r py-12">
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

        <div className="flex w-fit max-w-2xl flex-col justify-center  p-12">
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
                        <div className="grid-cols grid grid-cols-5 gap-3">
                          {files.map((file) => {
                            const imageUrl = URL.createObjectURL(file);
                            return (
                              <Image
                                key={file.name}
                                src={imageUrl}
                                alt={file.name}
                                width={500}
                                height={500}
                                className="block h-24 w-24 border-2 border-black/10 object-cover"
                              />
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
                  className={cn("space-y-6", {
                    hidden: page !== "location",
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
                                onValueChange={async (value) => {
                                  form.resetField("province");
                                  form.resetField("city");
                                  form.resetField("barangay");

                                  setLocationData((prev) => ({
                                    ...prev,
                                    provinces: [],
                                    cities: [],
                                    barangays: [],
                                  }));

                                  const regname = await regionByCode(value);
                                  console.log(
                                    "🚀 ~ onValueChange={ ~ regname:",
                                    regname,
                                  );

                                  console.log(
                                    "🚀 ~ onValueChange={ ~ value:",
                                    value,
                                  );

                                  const { region_name } =
                                    await regionByCode(value);

                                  field.value = region_name;
                                  const provinceData = await provinces(value);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    provinces: provinceData,
                                  }));
                                }}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.regions.map((region) => (
                                    <SelectItem
                                      value={region.region_code}
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
                                onValueChange={async (value) => {
                                  form.resetField("city");
                                  form.resetField("barangay");

                                  setLocationData((prev) => ({
                                    ...prev,
                                    cities: [],
                                    barangays: [],
                                  }));

                                  const { province_name } =
                                    await provincesByCode(value);

                                  field.value = province_name;

                                  const cityData = await cities(value);

                                  setLocationData((prev) => ({
                                    ...prev,
                                    cities: cityData,
                                  }));
                                }}
                              >
                                <SelectTrigger className="">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.provinces.map((province) => (
                                    <SelectItem
                                      value={province.province_code}
                                      key={province.province_code}
                                    >
                                      {province.province_name}
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
                        name="city"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>City / Municipality</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={async (value) => {
                                  form.resetField("barangay");

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
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.cities.map((city) => (
                                    <SelectItem
                                      value={city.city_code}
                                      key={city.city_code}
                                      onClick={() => {
                                        field.value = city.city_name;
                                      }}
                                    >
                                      {city.city_name}
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
                        name="barangay"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Barangay</FormLabel>
                            <FormControl>
                              <Select>
                                <SelectTrigger className="">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent onBlur={field.onBlur}>
                                  {locationData.barangays.map((barangay) => (
                                    <SelectItem
                                      value={barangay.brgy_code}
                                      key={barangay.brgy_code}
                                      onClick={() => {
                                        field.value = barangay.brgy_name;
                                      }}
                                    >
                                      {barangay.brgy_name}
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

export default NewTestingCenter;
