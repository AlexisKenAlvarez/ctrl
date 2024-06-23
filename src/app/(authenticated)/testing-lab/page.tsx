import TestingCenter from "@/components/TestingCenter";
import { api } from "@/trpc/server";

const page = async () => {
  const user = await api.auth.getSession();

  const centersData = await api.lab.getCenters({
    owner: user.user!.id ?? "",
    status: "all",
  });

  return (
    <div className=" flex flex-1 flex-col ">
      <TestingCenter centersData={centersData} owner={user.user!.id} />
    </div>
  );
};

export default page;
