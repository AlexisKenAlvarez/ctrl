"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { CircleUserRound, AlignJustify } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import Link from "next/link";

const Nav = ({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean;
  role: "user" | "testing_center" | "admin";
}) => {
  const router = useRouter();
  return (
    <nav className="sticky left-0 top-0 z-50 mx-auto w-full bg-white">
      <nav className="mx-auto w-full p-5">
        <div className="mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              alt="Logo"
              width={500}
              height={500}
              src="/logo.webp"
              className="w-44"
            />
          </Link>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="space-x-3 rounded-full">
                  <AlignJustify />
                  <CircleUserRound />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "testing_center" && (
                  <DropdownMenuItem asChild>
                    <Link href="/testing-center">Dashboard</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.refresh();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="rounded-xl hover:bg-blue"
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
