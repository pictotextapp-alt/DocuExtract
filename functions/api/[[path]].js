export const onRequest = async (context) => {
  const { request, env } = context;
  
  // Your Replit backend URL
  const REPLIT_BACKEND = "https://docu-extract-sivask209.replit.app";
  
  try {
    // Get the API path (everything after /api/)
    const url = new URL(request.url);
    // ADD SITEMAP HANDLING HERE - BEFORE apiPath line
    if (url.pathname === '/sitemap.xml') {
      const sitemapResponse = await fetch(`${REPLIT_BACKEND}/sitemap.xml`);
      if (sitemapResponse.ok) {
        const sitemapContent = await sitemapResponse.text();
        return new Response(sitemapContent, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
      return new Response('Sitemap not found', { status: 404 });
    }
    
    const apiPath = url.pathname + url.search;
    
    // Create target URL for Replit
    const targetUrl = `${REPLIT_BACKEND}${apiPath}`;
    
    console.log("Proxying to:", targetUrl);
    
    // Create headers object and remove problematic headers
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ray");
    
    // Forward the request to Replit
    const forwardedRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
    });
    
    // Call your Replit backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(forwardedRequest, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("Replit response status:", response.status);
    console.log("Replit response headers:", Object.fromEntries(response.headers));
    
    // Get response content
    const responseBody = await response.text();
    
    // Check if response is HTML (error page) instead of expected JSON/data
    if (response.status >= 400 && responseBody.includes('<!DOCTYPE') || responseBody.includes('<html')) {
      console.error("Replit returned HTML error page:", responseBody.substring(0, 200));
      return new Response(JSON.stringify({ 
        error: "Backend service unavailable",
        message: "Replit backend is not responding correctly. Please try again.",
        status: response.status
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return successful response
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error("Proxy error:", error);
    
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: "Request timeout",
        message: "Backend took too long to respond. Please try again."
      }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: "Proxy connection failed",
      message: error.message,
      details: "Could not connect to Replit backend"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
