/**
 * Cloudflare Worker for Visualizing Reverse
 * Japanese -> English translation via DeepL API
 *
 * Required secret:
 *   DEEPL_API_KEY
 *
 * Optional variable:
 *   ALLOWED_ORIGINS
 *   Example:
 *   https://yourname.github.io,https://school.example.jp
 *
 * Optional variable:
 *   DEEPL_PLAN
 *   "free" (default) or "pro"
 */

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

  let allowOrigin = "*";

  if (allowed.length > 0) {
    allowOrigin = allowed.includes(origin) ? origin : "null";
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, cors);
    }

    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);

    if (allowed.length > 0 && !allowed.includes(origin)) {
      return json({ error: "Origin not allowed." }, 403, cors);
    }

    if (!env.DEEPL_API_KEY) {
      return json({ error: "DEEPL_API_KEY is not configured." }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON." }, 400, cors);
    }

    const text = String(body?.text || "").trim();

    if (!text) {
      return json({ error: "Text is required." }, 400, cors);
    }

    if (text.length > 120) {
      return json({ error: "Text is too long. Maximum 120 characters." }, 400, cors);
    }

    const plan = String(env.DEEPL_PLAN || "free").toLowerCase();
    const endpoint =
      plan === "pro"
        ? "https://api.deepl.com/v2/translate"
        : "https://api-free.deepl.com/v2/translate";

    const params = new URLSearchParams();
    params.set("text", text);
    params.set("source_lang", "JA");
    params.set("target_lang", "EN-US");

    try {
      const deepl = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await deepl.json();

      if (!deepl.ok) {
        const message =
          data?.message ||
          `DeepL request failed (${deepl.status})`;
        return json({ error: message }, 502, cors);
      }

      const translation = data?.translations?.[0]?.text;

      if (!translation) {
        return json({ error: "No translation was returned." }, 502, cors);
      }

      return json({ translation }, 200, cors);
    } catch (err) {
      return json({ error: "Translation service is temporarily unavailable." }, 502, cors);
    }
  }
};
