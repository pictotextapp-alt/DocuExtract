# Cloudflare Pages Deployment Guide

## Project Structure Overview

Your project is now structured for Cloudflare Pages deployment:

```
├── src/                    # React frontend source (moved from client/src)
├── server/                 # Express.js backend (unchanged)
├── public/                 # Static assets and HTML entry point
├── shared/                 # Shared types and schemas
├── dist/                   # Build output directory
├── wrangler.toml           # Cloudflare Pages configuration
├── build-cf.js             # Custom build script
└── README.md               # Full documentation
```

## Quick Deploy Commands

### 1. Build for Production
```bash
# Option A: Use the custom build script
node build-cf.js

# Option B: Use npm (if package.json is updated)
npm run build

# Option C: Manual build
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### 2. Deploy to Cloudflare Pages

#### Via GitHub (Recommended)
1. Push code to GitHub repository
2. Connect repo to Cloudflare Pages dashboard
3. Set build settings:
   - **Build command**: `npm run build` or `node build-cf.js`
   - **Build output directory**: `dist`
   - **Root directory**: (leave blank)

#### Via Wrangler CLI
```bash
# Deploy directly
npx wrangler pages deploy dist --project-name docuextract
```

## Environment Variables

Set these in Cloudflare Pages dashboard → Settings → Environment variables:

```
DATABASE_URL=your_postgresql_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id  
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
OCR_SPACE_API_KEY=your_ocr_space_api_key
SESSION_SECRET=your_session_secret
```

## Build Output

After successful build:
- Frontend: Static files in `dist/public/`
- Backend: Bundled server in `dist/index.js`
- Dependencies: Production `package.json` in `dist/`

## Development vs Production

### Development (Replit)
```bash
npm run dev  # Runs both Vite dev server and Express server
```

### Production (Cloudflare Pages)
- Static frontend served by Cloudflare Pages
- Backend functions handle server-side logic
- Database connections via environment variables

## Troubleshooting

- **Build fails**: Check that all dependencies are installed
- **Environment variables**: Ensure all required secrets are set in Cloudflare
- **Path issues**: Verify that asset paths are relative, not absolute
- **Database connection**: Use connection pooling for serverless compatibility