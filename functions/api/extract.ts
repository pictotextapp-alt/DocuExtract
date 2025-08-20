// functions/api/extract.ts

export const onRequestPost: PagesFunction<{ OCRSPACE_API_KEY: string }> = async (ctx) => {
  const url = new URL(ctx.request.url);

  // ✅ Accept both /api/extract and /api/extract-text
  if (!url.pathname.endsWith("/api/extract") && !url.pathname.endsWith("/api/extract-text")) {
    return json({ error: true, message: "Not found" }, 404);
  }

  try {
    const formData = await ctx.request.formData();
    const file = formData.get("file");

    // Check file
    if (!(file instanceof File)) {
      return json({ error: true, message: "No file provided (expect form-data field 'file')" }, 400);
    }

    // Check API key
    const apiKey = ctx.env.OCRSPACE_API_KEY;
    if (!apiKey) {
      return json({ error: true, message: "OCRSPACE_API_KEY missing at runtime" }, 500);
    }

    // Build upstream form-data
    const upstream = new FormData();
    upstream.append("file", file, file.name || "upload.png");
    upstream.append("language", "eng");
    upstream.append("isOverlayRequired", "false");

    // Call OCR.space
    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: upstream,
    });

    const contentType = r.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await r.json() : await r.text();

    if (!r.ok) {
      return json(
        { error: true, status: r.status, upstreamContentType: contentType, raw: body },
        502
      );
    }

    // Extract text
    const text =
      (body as any)?.ParsedResults?.map((p: any) => p.ParsedText).join("\n") ?? "";

    return json({ ok: true, text, raw: body }, 200);
  } catch (err: any) {
    return json({ error: true, message: err?.message || "Unhandled error" }, 500);
  }
};

export const onRequestGet: PagesFunction = async () => {
  return json({ ok: true, message: "Use POST with multipart/form-data" }, 200);
};

// Small helper to guarantee JSON on every path
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
