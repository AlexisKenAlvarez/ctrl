import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { createClient } from "supabase/supabaseServer";
import type { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Nav isLoggedIn={user ? true : false} role={null} />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
