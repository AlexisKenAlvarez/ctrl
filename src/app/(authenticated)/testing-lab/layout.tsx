import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const userFromSession = await api.auth.getUserFromSession();

  if (userFromSession?.user_role === "admin") {
    return <div className="flex flex-1 flex-col md:px-16">{children}</div>;
  }

  if (userFromSession?.user_role !== "testing_center" || !userFromSession) {
    redirect("/");
  }

  return <div className="flex flex-1 flex-col md:px-16">{children}</div>;
};

export default layout;
