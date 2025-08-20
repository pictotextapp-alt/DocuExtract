// functions/api/extract-text.ts

export const onRequestPost = async (ctx) => {
  // Only handle POST
  if (ctx.request.method !== "POST") {
    return new Response(JSON.stringify({ error: true, message: "Use POST" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const formData = await ctx.request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: true, message: "No file provided (expect form-data field 'file')" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const apiKey = ctx.env?.OCRSPACE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: true, message: "OCRSPACE_API_KEY missing at runtime" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    // Forward to OCR.space
    const upstream = new FormData();
    upstream.append("file", file, file.name || "upload.png");
    upstream.append("language", "eng");
    upstream.append("isOverlayRequired", "false");

    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: upstream,
    });

    const ct = r.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await r.json() : await r.text();

    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: true, status: r.status, upstreamContentType: ct, raw: body }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    // Normalize text from OCR.space
    const parsedResults = (body?.ParsedResults || []);
    const text =
      parsedResults.map((p) => (p?.ParsedText || "").toString()).join("\n");

    // Derive extras some UIs expect
    const words =
      typeof text === "string" && text.trim()
        ? text.trim().split(/\s+/).filter(Boolean).length
        : 0;

    // Try to compute confidence if available; else null
    let confidence = null;
    try {
      const wordConfs = parsedResults.flatMap((p) =>
        (p?.TextOverlay?.Lines ?? []).flatMap((ln) =>
          (ln?.Words ?? [])
            .map((w) => Number(w?.WordConfidence))
            .filter((n) => Number.isFinite(n))
        )
      );
      if (wordConfs.length) {
        confidence = Math.round(wordConfs.reduce((a, b) => a + b, 0) / wordConfs.length);
      } else {
        const mc = Number(parsedResults[0]?.MeanConfidence);
        if (Number.isFinite(mc)) confidence = Math.round(mc);
      }
    } catch {
      confidence = null;
    }

    // Return multiple aliases so the frontend (whatever it expects) can show the text
    return new Response(
      JSON.stringify({
        ok: true,
        text,                 // common
        extractedText: text,  // alias 1
        result: text,         // alias 2
        content: text,        // alias 3
        words,
        confidence,
        raw: body
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: true, message: err?.message || "Unhandled error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};

export const onRequestGet = async () => {
  return new Response(
    JSON.stringify({ ok: true, message: "Use POST with multipart/form-data" }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};
