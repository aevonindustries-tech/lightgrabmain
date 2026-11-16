import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const settingsQuery = queryOptions({
  queryKey: ["platform_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("platform_settings").select("*").maybeSingle();
    if (error) throw error;
    return data;
  },
});
