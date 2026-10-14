
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server configuration is missing");
    }

    const { email, whatsapp, consent } = await req.json();

    if (
      typeof email !== "string" ||
      typeof whatsapp !== "string" ||
      consent !== true
    ) {
      return Response.json(
        { error: "Please provide your email, WhatsApp number, and consent." },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanWhatsApp = whatsapp.trim();

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (
      cleanWhatsApp.length < 7 ||
      cleanWhatsApp.length > 25 ||
      !/^[+0-9()\-\s]+$/.test(cleanWhatsApp)
    ) {
      return Response.json(
        { error: "Please enter a valid WhatsApp number." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("waitlist")
      .insert({
        email: cleanEmail,
        whatsapp: cleanWhatsApp,
        consent: true,
      });

    if (error) {
      console.error("Waitlist insert failed:", error.message);
      return Response.json(
        { error: "We couldn't save your signup. Please try again." },
        { status: 500, headers: corsHeaders }
      );
    }

    return Response.json(
      { success: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Waitlist request failed:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
});
