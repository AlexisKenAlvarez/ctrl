import LabView from "@/components/LabView";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { id: string } }) => {
  const labId = params.id;

  const labData = await api.user.getSingleCenter({
    id: labId,
  });

  if (!labData) {
    redirect("/");
  }

  const reviews = await api.user.getReviews({
    labId: parseInt(labId),
  });

  const user = await api.auth.getUserFromSession();

  const isAuthor = labData.owner === user?.id;
  const isNotAccepted = labData.status !== "accepted";
  const isAdmin = user?.user_role === "admin";

  if (isAdmin || isAuthor) {
    return <LabView labData={labData} labId={labId} reviewsData={reviews} />;
  }

  if (isNotAccepted) {
    console.log("🚀 ~ page ~ isNotAccepted:", isNotAccepted);
    console.log("Redirect");
    redirect("/");
  }

  return <LabView labData={labData} labId={labId} reviewsData={reviews} />;
};

export default page;
