"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";

const Footer = () => {
  const pathname = usePathname().split("/");

  const path = pathname[1];

  return (
    <footer className="mx-auto w-full bg-white">
      <footer className="mx-auto w-full">
        <div
          className={cn("mx-auto text-sm ", {
            "max-w-screen-xl md:px-16 2xl:px-0": path === "labs",
          })}
        >
          <Separator className="h-1" />
          <div className="flex w-full items-center justify-between  px-5 py-5">
            <h1 className="">@ 2024 CTRL+ Inc</h1>
            <p className="">All rights reserved</p>
          </div>
        </div>
      </footer>
    </footer>
  );
};

export default Footer;
