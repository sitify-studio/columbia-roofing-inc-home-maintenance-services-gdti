This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
API_BASE_URL=https://sitifystudio.com/api

# Site Configuration
NEXT_PUBLIC_WEBBUILDER_SITE_SLUG=your-site-slug

# Revalidation Secret (for ISR on-demand revalidation)
REVALIDATE_SECRET=your-secret-key-here

# Chatbot Configuration (optional)
GEMINI_API_KEY=your-gemini-api-key
```

## ISR (Incremental Static Regeneration)

This project uses Next.js ISR for efficient data caching and revalidation:

- **Automatic Revalidation**: Data is cached for 60 seconds by default
- **On-Demand Revalidation**: Call `/api/revalidate` endpoint to trigger immediate updates
- **No Polling**: Removed client-side polling for better performance

### Triggering On-Demand Revalidation

When content changes in your backend, call the revalidation endpoint:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-secret-key-here",
    "path": "/"
  }'
```

Or revalidate specific paths:
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-secret-key-here",
    "path": "/services"
  }'
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
