# Cloudflare Workers Deployment Guide

## Project Structure Overview

Your PictoText application is configured for Cloudflare Workers deployment as a full-stack Express.js application:

```
├── src/                    # React frontend source (production builds)
├── client/src/             # React frontend source (development)
├── server/                 # Express.js backend
│   ├── index.ts           # Main server entry point
│   ├── routes.ts          # API routes
│   ├── paypal.ts          # PayPal integration
│   └── ocr-service.ts     # OCR processing
├── shared/                 # Shared types and schemas
├── public/                 # Static assets
├── wrangler.toml           # Cloudflare Workers configuration
└── README.md               # Documentation
```

## Deployment Configuration

The `wrangler.toml` file is configured for Workers deployment:

```toml
name = "pictotext-backend"
main = "server/index.ts"
compatibility_date = "2024-08-19"
compatibility_flags = ["nodejs_compat"]
```

- **name**: Unique Worker name across Cloudflare
- **main**: Entry point to your Express.js server
- **compatibility_flags**: Enables Node.js compatibility for Express, OCR libraries, etc.

## Environment Variables Required

Set these secrets in Cloudflare Workers:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# OAuth
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# OCR
OCR_SPACE_API_KEY="your-ocr-space-api-key"

# Session
SESSION_SECRET="your-session-secret"
```

## Deployment Steps

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Set Environment Variables
```bash
wrangler secret put DATABASE_URL
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put PAYPAL_CLIENT_ID
wrangler secret put PAYPAL_CLIENT_SECRET
wrangler secret put OCR_SPACE_API_KEY
wrangler secret put SESSION_SECRET
```

### 4. Deploy to Workers
```bash
wrangler deploy
```

## Development vs Production

### Development (Replit)
- Uses `/client/src` structure for compatibility with existing Vite setup
- Express server runs normally with full Node.js environment
- Hot reloading and development features enabled

### Production (Cloudflare Workers)
- Uses `/src` structure for optimized builds
- Express server runs on Cloudflare Workers runtime
- Automatic scaling and global edge deployment

## Database Considerations

For production deployment, ensure your PostgreSQL database:
- Is accessible from Cloudflare Workers (publicly accessible or via Cloudflare Tunnel)
- Has connection pooling configured for serverless workloads
- Consider using services like:
  - **Neon**: Serverless PostgreSQL with automatic scaling
  - **Supabase**: PostgreSQL with built-in APIs
  - **Cloudflare D1**: Serverless SQLite (requires schema migration)

## Monitoring and Logs

View logs and metrics:
```bash
# View recent logs
wrangler tail

# View Worker analytics
wrangler analytics
```

## Custom Domain (Optional)

Add a custom domain:
1. Go to Cloudflare Workers dashboard
2. Navigate to your `pictotext-backend` worker
3. Click "Triggers" tab
4. Add custom domain and configure DNS

## Rollback

If deployment fails, rollback to previous version:
```bash
wrangler rollback
```

Your PictoText application will be available at:
`https://pictotext-backend.your-subdomain.workers.dev`