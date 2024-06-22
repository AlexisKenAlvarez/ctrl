import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SelectRole from "@/components/SelectRole";
import { createClient } from "supabase/supabaseServer";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("🚀 ~ user:", user?.user_metadata.role);

  return (
    <div>
      <div className="flex min-h-screen flex-col ">
        <Nav
          isLoggedIn={user ? true : false}
          role={
            (user?.user_metadata.role as
              | "testing_center"
              | "user"
              | "admin"
              | null) ?? null
          }
        />
        <div className="flex flex-1 flex-col">
          {user && user.user_metadata.role === undefined ? (
            <SelectRole userId={user?.id} />
          ) : (
            <div className="flex flex-1 flex-col">{children}</div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
