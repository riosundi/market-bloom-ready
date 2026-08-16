# Plan - Add Catalog with Samples

Implement a "Product Catalog" section on the landing page that displays real sample products from the Shopify store to showcase the marketplace's offerings.

## Proposed Changes

### ON A NEW Page 

- Add a new "Featured Catalog" section to  `THE NEW LOG`below the Categories section.
- Use the Shopify Storefront API to fetch a subset of products for the catalog.
- Implement a visually appealing grid of product cards showcasing:
  - High-quality product images.
  - Titles and descriptions.
  - Pricing in Zambian Kwacha (K).
- Add "View Details" buttons that prompt users to sign in or sign up to start ordering.
- Ensure the design maintains the existing glass-morphism and premium branding style.

## Technical Details

- Utilize `storefrontApiRequest` from `src/lib/shopify.ts` to fetch products.
- Use `useQuery` from `@tanstack/react-query` to handle data fetching and loading states.
- Reuse `formatCurrency` from `src/lib/roles.ts` for consistent price formatting.
- Implement responsive grid layouts for the catalog (1 column on mobile, 2 on tablet, 4 on desktop).