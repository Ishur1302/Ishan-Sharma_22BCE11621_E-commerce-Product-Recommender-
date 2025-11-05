// Placeholder function to satisfy build requirements
// This project uses Firebase, not Supabase edge functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(() => {
  return new Response(
    JSON.stringify({ message: "This project uses Firebase" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
