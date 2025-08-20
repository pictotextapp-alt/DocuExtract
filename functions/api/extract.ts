// functions/api/extract.ts

// Always-JSON GET (handy for quick checks)
export const onRequestGet = async () => {
  return json({ ok: true, message: "Use POST with multipart/form-data" }, 200);
};

// Main POST handler
export const onRequestPost = async (ctx: any) => {
  try {
    // 1) Parse multipart form-data
    const formData = await ctx.request.formData();
    const file: any = formData.get("file");

    // Avoid relying on TS "File" type; just check shape at runtime
    const isFileLike =
      file &&
      (typeof file.arrayBuffer === "function" || typeof file.stream === "function");

    if (!isFileLike) {
      return json(
        { error: true, message: "No file provided (expect form-data field 'file')" },
        400
      );
    }

    // 2) Runtime secret
    const apiKey = ctx.env?.OCRSPACE_API_KEY;
    if (!apiKey) {
      return json({ error: true, message: "OCRSPACE_API_KEY missing at runtime" }, 500);
    }

    // 3) (Soft) validation — only if props exist
    const MAX = 8 * 1024 * 1024; // 8MB
    const okTypes = new Set(["image/png", "image/jpeg", "application/pdf"]);
    if (typeof file.size === "number" && file.size > MAX) {
      return json({ error: true, message: "File too large" }, 413);
    }
    if (file.type && !okTypes.has(file.type)) {
      return json({ error: true, message: `Unsupported type: ${file.type}` }, 415);
    }

    // 4) Forward to OCR.space
    const upstream = new FormData();
    upstream.append("file", file, file.name || "upload");
    upstream.append("language", "eng");
    upstream.append("isOverlayRequired", "false");

    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: upstream,
    });

    const contentType = r.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await r.json() : await r.text();

    if (!r.ok) {
      // Always respond with JSON so the frontend .json() never fails
      return json(
        { error: true, status: r.status, upstreamContentType: contentType, raw: body },
        502
      );
    }

    // 5) Normalize text
    let text = "";
    const parsed = (body as any)?.ParsedResults;
    if (Array.isArray(parsed)) {
      text = parsed.map((p: any) => p?.ParsedText ?? "").join("\n");
    }

    return json({ ok: true, text, raw: body }, 200);
  } catch (err: any) {
    return json({ error: true, message: err?.message || "Unhandled error" }, 500);
  }
};

// Small helper to guarantee JSON on every path
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
