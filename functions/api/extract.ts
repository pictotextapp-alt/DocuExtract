export const onRequestGet = async () => {
  return new Response(JSON.stringify({ ok: true, message: "Use POST with multipart/form-data" }), {
    headers: { "content-type": "application/json" },
  });
};

export const onRequestPost = async ({ request, env }: any) => {
  try {
    if (!env.OCRSPACE_API_KEY) {
      return new Response(JSON.stringify({ error: true, message: "OCRSPACE_API_KEY missing at runtime" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: true, message: "No file provided" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

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

    const contentType = r.headers.get("content-type") || "";
    const raw = await r.text();
    let json: any = null;
    if (contentType.includes("application/json")) {
      try { json = JSON.parse(raw); } catch {}
    }

    if (!r.ok) {
      return new Response(JSON.stringify({ error: true, status: r.status, upstreamContentType: contentType, raw }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    if (json?.ParsedResults?.[0]?.ParsedText != null) {
      return new Response(JSON.stringify({ text: json.ParsedResults[0].ParsedText, raw: json }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ raw, upstreamContentType: contentType }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: true, message: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
