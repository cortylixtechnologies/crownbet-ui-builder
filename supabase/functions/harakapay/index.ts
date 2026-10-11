import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const BASE = "https://harakapay.net/api/v1";
const KEY = Deno.env.get("HARAKAPAY_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Ask HarakaPay for the real status; credit once if completed.
async function verifyAndSettle(orderId: string) {
  const r = await fetch(`${BASE}/status/${encodeURIComponent(orderId)}`, { headers: { "X-API-Key": KEY } });
  const data = await r.json().catch(() => ({}));
  const status: string = data?.payment?.status ?? "pending";
  if (status === "completed") {
    await admin.rpc("credit_deposit", { _order_id: orderId });
  } else if (status === "failed") {
    await admin.from("deposits").update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("order_id", orderId).is("credited_at", null);
  }
  return status;
}

const StartSchema = z.object({
  action: z.literal("start"),
  phone: z.string().regex(/^(0|255|\+255)[67]\d{8}$/, "Enter a valid phone, e.g. 0712345678"),
  amount: z.number().int().min(100).max(10_000_000),
});
const CheckSchema = z.object({ action: z.literal("check"), order_id: z.string().min(3).max(64) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  try {
    // Webhook from HarakaPay (unsigned) — never trust body, re-verify via API.
    if (url.searchParams.get("webhook") === "1") {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.order_id === "string") await verifyAndSettle(body.order_id);
      return json({ ok: true });
    }

    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const raw = await req.json();
    if (raw?.action === "start") {
      const p = StartSchema.safeParse(raw);
      if (!p.success) return json({ error: p.error.issues[0].message }, 400);
      let phone = p.data.phone.replace(/^\+?255/, "0");
      const r = await fetch(`${BASE}/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": KEY },
        body: JSON.stringify({
          phone, amount: p.data.amount, description: "CrownBet deposit",
          webhook_url: `${SUPABASE_URL}/functions/v1/harakapay?webhook=1`,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!data?.success || !data.order_id) return json({ error: data?.error || data?.message || "Payment request failed" }, 502);
      await admin.from("deposits").insert({ user_id: user.id, phone, amount: p.data.amount, order_id: data.order_id });
      return json({ order_id: data.order_id });
    }

    const c = CheckSchema.safeParse(raw);
    if (!c.success) return json({ error: "Invalid request" }, 400);
    const { data: dep } = await admin.from("deposits").select("user_id").eq("order_id", c.data.order_id).maybeSingle();
    if (!dep || dep.user_id !== user.id) return json({ error: "Not found" }, 404);
    return json({ status: await verifyAndSettle(c.data.order_id) });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
