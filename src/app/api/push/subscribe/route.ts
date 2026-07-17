import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const subscription = (await request.json()) as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: true, persisted: false, note: "Supabase non configurato in questo ambiente demo." });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("push_subscriptions").upsert(
      {
        utente_id: user?.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: "endpoint" }
    );

    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
