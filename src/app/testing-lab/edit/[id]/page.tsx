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
  const labId = params.id;
  const user = await api.auth.getUserFromSession()
  const centerData = await api.user.getSingleCenter({
    id: labId,
  });

  if (user?.user_role === 'admin') {
    return <EditCenter centerData={centerData} labId={labId} />;
  }

  if (centerData.owner !== user?.id) {
    redirect("/")
  }

  return <EditCenter centerData={centerData} labId={labId} />;
};

export default page;
