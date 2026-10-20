# MERAS Store

A modern Arabic RTL fashion storefront built for **MERAS**, focused on abayas and dresses with a premium editorial shopping experience.

## Highlights

- Arabic-first RTL responsive interface
- Product catalog connected to Shopify Storefront API
- Real Shopify product variants, pricing and availability
- Cart creation and redirect to Shopify checkout
- Mobile navigation and responsive layouts
- Smooth scrolling with Lenis
- Motion and scroll-based interactions with Framer Motion
- Optimized product imagery with Next.js Image
- Fashion-focused sections for new arrivals, abayas, dresses and occasions

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Shopify Storefront API / GraphQL
- Framer Motion
- Lenis
- Lucide React

## Run Locally

```bash
npm install
npm run dev
```

Create a `.env.local` file when connecting another Shopify store and configure the required Shopify environment variables.

## Production

```bash
npm run build
npm start
```

## Project Focus

The project combines a custom branded frontend with Shopify commerce infrastructure, allowing the storefront experience to remain fully customized while products and checkout are handled through Shopify.
