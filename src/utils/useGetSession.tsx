"use client";

import type { Session } from "@supabase/supabase-js";
import { supabase } from "supabase/supabaseClient";
import { useEffect, useState } from "react";

const useGetSession = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      void (async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setLoading(false);
      })();
    } catch (error) {
      console.log(error);
      setSession(null);
      setLoading(false);
    }
  }, []);

  return {
    session,
    loading,
  };
};

export default useGetSession;
