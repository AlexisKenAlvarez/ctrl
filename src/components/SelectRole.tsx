"use client";

import { cn } from "@/lib/utils";
import { UserRound, Building2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { supabase } from "supabase/supabaseClient";
import { useRouter } from "next/navigation";

const SelectRole = ({ userId }: { userId: string }) => {
  type userRole = "user" | "testing_center" | null;

  const [selectedRole, setRole] = useState<userRole>(null);
  const updateUser = api.user.updateRole.useMutation();
  const router = useRouter();

  return (
    <div className="p-5">
      <div className="mx-auto max-w-screen-2xl text-center">
        <h1 className="text-2xl font-bold">Select your Role</h1>
        <p className="mt-2 opacity-50">What type of user are you?</p>

        <div className="mt-14 flex items-center justify-center gap-14">
          {USER_ROLE.map((role) => (
            <button
              onClick={() => setRole(role.value as userRole)}
              className={cn(
                "relative flex h-56 w-56 flex-col items-center justify-center rounded-md border transition-all duration-300 ease-in-out",
                {
                  "border-blue bg-blue/5": role.value === selectedRole,
                },
              )}
              key={role.name}
            >
              {role.value === selectedRole && (
                <div className="bg-blue absolute top-0 -translate-y-1/2 rounded-full p-1 transition-all duration-300 ease-in-out">
                  <Check size={16} color="white" />
                </div>
              )}

              <role.icon
                size={70}
                strokeWidth="1"
                color={role.value === selectedRole ? "#43A6F6" : "black"}
              />
              <p
                className={cn("mt-6 font-medium uppercase", {
                  "text-blue": role.value === selectedRole,
                })}
              >
                {role.name}
              </p>
            </button>
          ))}
        </div>

        <Button
          className="hover:bg-blue mt-14 rounded-xl"
          disabled={!selectedRole || updateUser.isPending}
          onClick={async () => {
            await updateUser.mutateAsync({
              id: userId,
              role: selectedRole!,
            });

            await supabase.auth.updateUser({
              data: {
                role: selectedRole!,
              },
            });

            router.refresh();
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SelectRole;

const USER_ROLE = [
  {
    name: "User",
    icon: UserRound,
    value: "user",
  },
  {
    name: "Testing Center",
    icon: Building2,
    value: "testing_center",
  },
];
