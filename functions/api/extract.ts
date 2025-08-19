// /functions/api/extract.ts
export const onRequestPost = async ({ request, env }: any) => {
  try {
    // Expect multipart/form-data with a field named "file"
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: true, message: "No file provided" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Forward to OCR.space
    const body = new FormData();
    body.append("language", "eng");
    body.append("isOverlayRequired", "false");
    body.append("OCREngine", "2");
    body.append("file", file, "upload.png");

    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: env.OCRSPACE_API_KEY as string },
      body,
    });

    // Read raw text first; try JSON parse safely
    const raw = await r.text();
    let json: any = null;
    try { json = JSON.parse(raw); } catch { /* keep raw for debugging */ }

    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: true, status: r.status, message: "OCR API error", raw }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    // Normalize success payload
    // OCR.space typical: { ParsedResults: [{ ParsedText: "..." }], ... }
    if (json && json.ParsedResults && json.ParsedResults[0]) {
      return new Response(
        JSON.stringify({
          text: json.ParsedResults[0].ParsedText ?? "",
          raw: json, // keep full response if you want to show confidence/lines later
        }),
        { headers: { "content-type": "application/json" } }
      );
    }

    // Fallback: return whatever we got
    return new Response(JSON.stringify(json ?? { raw }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
