# PictoText

Professional OCR web application for extracting and manipulating text from images using advanced OCR technology.

## Features

- **Professional OCR**: Extract text from images with enterprise-grade accuracy
- **Privacy-First**: Images processed in memory only (2-5 seconds), never stored
- **Multi-language Support**: Extract text in 100+ languages (Premium)
- **Authentication**: Google OAuth and email registration
- **Flexible Tiers**: Free (3 daily) and Premium (1500 monthly) usage
- **PayPal Integration**: Secure subscription management
- **Responsive Design**: Works perfectly on all devices

## Project Structure

```
├── src/                    # React frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── server/                # Express.js backend
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API endpoints
│   ├── paypal.ts          # PayPal integration
│   └── ocr-service.ts     # OCR processing
├── shared/                # Shared types and schemas
├── public/                # Static assets and HTML
├── dist/                  # Production build output
└── wrangler.toml          # Cloudflare Pages configuration
```

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run database migrations
npm run db:push

# Type check
npm run check
```

## Deployment to Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Connect the repository to Cloudflare Pages
3. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave blank)

### Option 2: Manual Deployment

```bash
# Build for production
npm run build

# Deploy using Wrangler CLI
npx wrangler pages deploy dist --project-name docuextract
```

### Option 3: Custom Build Script

```bash
# Use the custom build script
node build-cf.js
```

## Environment Variables

Required environment variables for deployment:

```
DATABASE_URL=your_postgresql_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
OCR_SPACE_API_KEY=your_ocr_space_api_key
SESSION_SECRET=your_session_secret
```

## Configuration Files

- **wrangler.toml**: Cloudflare Pages configuration
- **vite.config.ts**: Vite build configuration
- **tailwind.config.ts**: Tailwind CSS configuration
- **drizzle.config.ts**: Database configuration
- **tsconfig.json**: TypeScript configuration

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (Google OAuth, Local)
- **Payments**: PayPal SDK
- **OCR**: OCR.space API with Tesseract.js fallback
- **Deployment**: Cloudflare Pages

## License

MIT License - see LICENSE file for details