import Profile from "@/components/Profile";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await api.auth.getSession();


  if (!session.user) {
    redirect("/");
  }

  const user = await api.user.getUser({ userId: session.user.id });

  console.log("🚀 ~ page ~ user:", user);

  return <Profile user={user} />;
};

export default page;
