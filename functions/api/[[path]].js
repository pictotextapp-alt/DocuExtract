// Cloudflare Pages Function to handle API routes
import { createServer } from '../dist/index.js';

export async function onRequest(context) {
  // Create Express server instance
  const server = createServer();
  
  // Convert Cloudflare Pages request to Express-compatible format
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Set environment variables from Cloudflare env
  if (env) {
    Object.assign(process.env, env);
  }
  
  return new Promise((resolve) => {
    const mockResponse = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.headers['Content-Type'] = 'application/json';
        this.body = JSON.stringify(data);
        resolve(new Response(this.body, {
          status: this.statusCode,
          headers: this.headers
        }));
      },
      send(data) {
        this.body = data;
        resolve(new Response(this.body, {
          status: this.statusCode,
          headers: this.headers
        }));
      },
      redirect(url) {
        resolve(Response.redirect(url, 302));
      }
    };

    const mockRequest = {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
      session: {},
      user: null
    };

    // Process the request through Express
    server.handle(mockRequest, mockResponse);
  });
}