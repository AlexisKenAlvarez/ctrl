import NewTestingCenter from "@/components/NewTestingCenter";
import { createClient } from "supabase/supabaseServer";

const page = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <NewTestingCenter user={ user } />;
};

export default page;
