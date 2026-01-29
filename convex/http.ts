import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as const;
}

http.route({
  path: "/push/stats",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders() })),
});

http.route({
  path: "/push/stats",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const stats = await ctx.runQuery(api.auth.getPushTokenStats, {});
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/push/send",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders() })),
});

http.route({
  path: "/push/send",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const title = String(body?.title ?? "").trim();
    const message = String(body?.body ?? "").trim();

    if (!title || !message) {
      return new Response(JSON.stringify({ error: "Missing title/body" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const tokens = await ctx.runQuery(api.auth.getAllPushTokens, {});
    const usersWithTokens = tokens.length;
    const usersTotal = (await ctx.runQuery(api.auth.getPushTokenStats, {})).usersTotal;

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, usersTotal, usersWithTokens: 0 }),
        { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    // Expo recommends chunking; 100 is a safe batch size.
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100));

    let sent = 0;
    let failed = 0;

    for (const chunk of chunks) {
      const messages = chunk.map((to) => ({
        to,
        sound: "default",
        title,
        body: message,
        data: { timestamp: Date.now() },
      }));

      const resp = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      if (!resp.ok) {
        failed += chunk.length;
        continue;
      }

      const json: any = await resp.json();
      const results: any[] = Array.isArray(json?.data) ? json.data : [];

      for (const r of results) {
        if (r?.status === "ok") sent += 1;
        else failed += 1;
      }
    }

    return new Response(JSON.stringify({ sent, failed, usersTotal, usersWithTokens }), {
      status: 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }),
});

export default http;