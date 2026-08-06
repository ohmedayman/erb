import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ensure user exists in registered_users
        const { error: insertError } = await supabase
          .from("registered_users")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            email: user.email,
            role: "user",
            subscription_status: "pending",
          });

        if (insertError && insertError.code === "23505") {
          // User already exists, that's fine
        }

        // Ensure store exists
        const storeName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email || "متجر") + " - مخزن";
        await supabase
          .from("stores")
          .upsert({
            id: user.id,
            name: storeName,
            owner_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            owner_email: user.email,
          }, { onConflict: "id" });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
