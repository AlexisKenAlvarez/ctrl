import LabView from "@/components/LabView";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { id: string } }) => {
  const labId = params.id;

  const labData = await api.user.getSingleCenter({
    id: labId,
  });

  const user = await api.auth.getUserFromSession();

  if (
    (labData.status === "pending" ||
      labData.status === "rejected" ||
      labData.status === "deleted") &&
    !user
  ) {
    redirect("/");
  }

  if (
    labData.owner !== user?.id &&
    (labData.status === "pending" ||
      labData.status === "rejected" ||
      labData.status === "deleted") &&
    user?.user_role !== "admin"
  ) {
    redirect("/");
  }

  return <LabView labData={labData} labId={labId} />;
};

export default page;
