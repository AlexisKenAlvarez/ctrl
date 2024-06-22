import ResetPassword from "@/components/ResetPassword";
import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";
import { Frown } from "lucide-react";
import Link from 'next/link';
import { createClient } from "supabase/supabaseServer";

const page = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const code = searchParams.code as string;
  console.log("🚀 ~ code:", code);
  const supabase = createClient();
  let session: Session | null = null;

  try {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    console.log("🚀 ~ data:", data);
    session = data.session;
  } catch (error) {
    console.log(error);
  }

  console.log("🚀 ~ session:", session);

  if (session) {
    await supabase.auth.refreshSession({
      refresh_token: session.refresh_token,
    });

    return (
      <ResetPassword
        accessToken={session.access_token}
        refreshToken={session.refresh_token}
      />
    );
  }

  return (
    <div className="grid h-screen w-full place-content-center space-y-3 p-5">
      <Frown size={34} className="mx-auto text-center" />
      <h1 className="">Reset password link expired or invalid.</h1>
      <Link href="/" className="w-full">
        <Button variant={"secondary"} className="w-full">Go back</Button>
      </Link>
    </div>
  );
};

export default page;
