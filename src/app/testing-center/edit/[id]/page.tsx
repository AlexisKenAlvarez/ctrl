import EditCenter from "@/components/EditCenter";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

const page = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const centerId = params.id;
  const user = await api.auth.getSession()
  const centerData = await api.user.getSingleCenter({
    id: centerId,
  });

  if (centerData.owner !== user.user?.id) {
    redirect("/")
  }

  return <EditCenter centerData={centerData} centerId={centerId} />;
};

export default page;
