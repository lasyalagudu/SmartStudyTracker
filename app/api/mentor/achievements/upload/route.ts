/**
 * POST /api/mentor/achievements/upload
 * Generates a Supabase Storage signed upload URL for certificate files.
 * The client uploads directly to Storage; we never proxy the file.
 *
 * Requires:  NEXT_PUBLIC_SUPABASE_URL  and  SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "mentor-certificates";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const { fileName, contentType } = await req.json() as { fileName: string; contentType: string };
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
    }

    // Validate content type
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) {
      return NextResponse.json({ error: "Only PDF and images are allowed" }, { status: 400 });
    }

    // Scope file path to the user so they can't overwrite each other
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    const path = `${clerkUser.id}/${Date.now()}_${safeName}`;

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data, error } = await adminClient.storage
      .from(BUCKET)
      .createSignedUploadUrl(path, { upsert: false });

    if (error) {
      console.error("[upload] Supabase error:", error);
      return NextResponse.json({ error: "Could not create upload URL" }, { status: 500 });
    }

    // Public URL (read) for later display
    const { data: { publicUrl } } = adminClient.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl, token: data.token, path });
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
