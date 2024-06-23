import EditCenter from "@/components/EditCenter";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { createClient } from "supabase/supabaseServer";

export const dynamic = 'force-dynamic'

const page = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  const labId = params.id;

  const centerData = await api.lab.getSingleCenter({
    id: labId,
  });

  if (user?.user_metadata.role === 'admin') {
    return <EditCenter centerData={centerData} labId={labId} user={user} />;
  }

  if (centerData.owner !== user?.id) {
    redirect("/")
  }

  return <EditCenter centerData={centerData} labId={labId} user={user} />;
};

export default page;
