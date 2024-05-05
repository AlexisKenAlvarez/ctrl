import { redirect } from "next/navigation";

const page = () => {
  redirect("/auth/signin");
};

export default page;
