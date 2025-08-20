              // functions/api/extract.ts

              export const onRequestPost = async (ctx) => {
                const url = new URL(ctx.request.url);

                // ✅ Accept both /api/extract and /api/extract-text
                if (!url.pathname.endsWith("/api/extract") && !url.pathname.endsWith("/api/extract-text")) {
                  return new Response(JSON.stringify({ error: true, message: "Not found" }), {
                    status: 404,
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

                  const apiKey = ctx.env.OCRSPACE_API_KEY;
                  if (!apiKey) {
                    return new Response(
                      JSON.stringify({ error: true, message: "OCRSPACE_API_KEY missing at runtime" }),
                      { status: 500, headers: { "content-type": "application/json" } }
                    );
                  }

                  const upstream = new FormData();
                  upstream.append("file", file, file.name || "upload.png");
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
                    return new Response(
                      JSON.stringify({ error: true, status: r.status, upstreamContentType: contentType, raw: body }),
                      { status: 502, headers: { "content-type": "application/json" } }
                    );
                  }

                  const text =
                    (body?.ParsedResults || []).map((p) => p?.ParsedText || "").join("\n");

                  return new Response(JSON.stringify({ ok: true, text, raw: body }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                  });
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
