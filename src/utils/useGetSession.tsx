"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "supabase/supabaseClient";

const useGetSession = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const removeSession = useCallback(() => {
    setSession(null);
  }, [])

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
    removeSession
  };
};

export default useGetSession;
