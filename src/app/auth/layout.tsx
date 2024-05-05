import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const data = await api.auth.getSession();

  if (data.user) {
    redirect("/");
  }

  return <div className="flex-1 flex flex-col">{children}</div>;
};

export default layout;
