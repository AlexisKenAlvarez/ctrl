/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { AlignJustify, CircleUserRound, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocationInterface } from "@/lib/locationTypes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { barangays } from "psgc";
import { useEffect, useState } from "react";
import { cities } from "select-philippines-address";
import { supabase } from "supabase/supabaseClient";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import type { RouterOutputs } from "@/trpc/react";

interface LocationData {
  name: string;
}

const Nav = ({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean;
  role: NonNullable<RouterOutputs["auth"]["getUserFromSession"]>["user_role"];
}) => {
  console.log("🚀 ~ role:", role);
  const [selected, setSelected] = useState<number | null>(null);
  const [citiesData, setCities] = useState<LocationInterface["cities"]>([]);
  const [result, setResult] = useState<LocationData[]>([]);

  const [search, setSearch] = useState("");

  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname().split("/");

  const path = pathname[1];

  useEffect(() => {
    void (async () => {
      const citiesData = await cities("0421");
      console.log("🚀 ~ void ~ citiesData:", citiesData);
      setCities(citiesData as LocationInterface["cities"]);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="sticky left-0 top-0 z-50 mx-auto w-full bg-white">
      <nav className="mx-auto w-full p-5">
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-3 md:px-16",
            {
              "max-w-screen-xl": path === "labs",
            },
          )}
        >
          <Link href="/" className="hidden sm:block">
            <Image
              alt="Logo"
              width={500}
              height={500}
              src="/logo.webp"
              className="w-44"
            />
          </Link>

          <div
            className={cn(
              "relative h-fit w-full max-w-[24rem] transition-all duration-300 ease-in-out",
              {
                "lg:max-w-[28rem]": focused,
              },
            )}
          >
            <Input
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={async (e) => {
                if (result.length === 0) {
                  setSelected(null);
                }

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelected((prev) =>
                    prev === null ? 0 : Math.min(prev + 1, result.length - 1),
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();

                  setSelected((prev) =>
                    prev === null ? 0 : Math.max(prev - 1, 0),
                  );
                } else if (e.key === "Enter") {
                  if (
                    (selected === null || result.length <= 0) &&
                    search !== ""
                  ) {
                    router.push(`/?search=${search}`);
                  } else if (selected !== null) {
                    const selectedResult = result[selected ?? 0];
                    router.push(`/?search=${selectedResult?.name}`);
                  }
                }
              }}
              placeholder="Search for location"
              onChange={(e) => {
                setSearch(e.target.value);
                const searchQuery = e.target.value;

                const searchBarangay = (query: string) => {
                  const barangayResult = barangays.filter(query);

                  const newResult = barangayResult
                    .filter((barangay) =>
                      barangay.code.toString().startsWith("0421"),
                    )
                    .slice(0, 5);

                  return newResult;
                };

                const searchCity = (query: string) => {
                  const regex = new RegExp(`^${query}`, "i");

                  const regData = citiesData.filter((city) =>
                    regex.test(city.city_name),
                  );

                  return regData;
                };

                if (searchBarangay(searchQuery).length > 0) {
                  setResult(
                    searchBarangay(searchQuery).map((barangay) => {
                      return {
                        name: `${barangay.name}, ${barangay.citymun}`,
                      };
                    }),
                  );
                } else if (searchCity(searchQuery).length > 0) {
                  setResult(
                    searchCity(searchQuery).map((city) => {
                      return {
                        name: city.city_name,
                      };
                    }),
                  );
                } else {
                  setResult([]);
                }
              }}
              value={search}
              className="w-full rounded-full drop-shadow-md transition-all duration-300 ease-in-out sm:py-6"
            />

            <Button className="absolute bottom-0 right-2 top-0 my-auto h-7 w-7 shrink-0 rounded-full bg-blue hover:bg-blue/80 sm:h-9 sm:w-9">
              <Search className="absolute" size={18} />
            </Button>

            {focused && result.length > 0 && (
              <ul className="absolute -bottom-2 w-full translate-y-full rounded-3xl border bg-white  p-3 drop-shadow-md">
                {result.map((item, index) => (
                  <li
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl p-3 text-sm font-light hover:bg-slate-100",
                      {
                        "bg-slate-100": selected === index,
                      },
                    )}
                    key={index}
                    onMouseDown={() => {
                      console.log("CLICKED");
                      router.push(`/?search=${item.name}`);
                    }}
                  >
                    <div className="w-fit rounded-lg bg-gray-200 p-2">
                      <MapPin strokeWidth={1} />
                    </div>
                    <h1>{item.name}</h1>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isLoggedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="space-x-3 rounded-full p-6  hover:bg-blue/90">
                    <AlignJustify />
                    <CircleUserRound />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="p-3">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {role === "testing_center" && (
                    <DropdownMenuItem asChild className="p-3">
                      <Link href="/testing-lab">Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  {role === "admin" && (
                    <DropdownMenuItem asChild className="p-3">
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={async () => {
                      console.log("SIGNOUT");
                      await supabase.auth.signOut();
                      console.log("SIGNOUT2");
                      router.refresh();
                    }}
                    className="p-3"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              className="rounded-xl  p-6 hover:bg-blue/90"
              onClick={() => router.push("/auth/signin")}
            >
              Sign in
            </Button>
          )}
        </div>
      </nav>
      <Separator className="" />
    </nav>
  );
};

export default Nav;
