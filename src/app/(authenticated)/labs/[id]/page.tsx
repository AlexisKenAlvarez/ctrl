import LabView from "@/components/LabView";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { id: string } }) => {
  const labId = params.id;

  const labData = await api.lab.getSingleCenter({
    id: labId,
  });

  if (!labData) {
    redirect("/");
  }

  const reviews = await api.lab.getReviews({
    labId: parseInt(labId),
  });

  const user = await api.auth.getUserFromSession();

  const isAuthor = labData.owner === user?.id;
  const isNotAccepted = labData.status !== "accepted";
  const isAdmin = user?.user_role === "admin";
  const isDeactivated = labData.deactivated;

  if (isAdmin || isAuthor) {
    return <LabView labData={labData} labId={labId} reviewsData={reviews} />;
  }

  if (isNotAccepted) {
    redirect("/");
  }

  if (isDeactivated && (user?.user_role === "user" || !isAuthor)) {
    redirect("/");
  }

  return <LabView labData={labData} labId={labId} reviewsData={reviews} />;
};

export default page;
