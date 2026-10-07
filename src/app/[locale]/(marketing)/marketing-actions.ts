"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function recordPageView(path: string) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Get or create session ID
    let sessionId = cookieStore.get("e17_session_id")?.value;
    if (!sessionId) {
      sessionId = uuidv4();
      cookieStore.set("e17_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        path: "/",
      });
    }

    // Try to get user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Insert to marketing_page_views
    // Fail silently if table doesn't exist yet
    await supabase.from("marketing_page_views").insert({
      path,
      user_id: user?.id || null,
      session_id: sessionId,
    });
  } catch (error) {
    // Fail silently for tracking errors
    console.error("Failed to record page view:", error);
  }
}
