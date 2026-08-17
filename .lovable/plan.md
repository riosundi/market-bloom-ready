# Plan: Marketplace Product Management Database

I will implement a robust product management system that allows sellers to manage their listings directly within the TILETA platform. While Shopify remains the primary storefront for high-fidelity catalog display, this internal database will power the local marketplace experience, inventory tracking, and order fulfillment workflows.

## User Review Required

> [!IMPORTANT]
> The product categories will default to the standard TILETA set (Food, Groceries, Electronics, etc.). Sellers will be able to mark products as active/inactive to control visibility in the marketplace.

## Proposed Changes

### Database (Supabase)

#### [NEW] Product Management Schema
- Enhance the existing `products` table (or verify it meets all requested requirements):
    - `id`: UUID (Primary Key)
    - `business_id`: UUID (Reference to `businesses`)
    - `name`: TEXT
    - `description`: TEXT
    - `price`: NUMERIC
    - `image_url`: TEXT
    - `category`: TEXT
    - `stock`: INTEGER
    - `status`: TEXT (active/inactive)
    - `created_at`: TIMESTAMPTZ
    - `updated_at`: TIMESTAMPTZ

#### [RLS] Security Policies
- Update/Add RLS policies to ensure:
    - **Sellers** can fully manage (CRUD) their own products.
    - **Students/Agents** can only view "active" products.
    - **Admins** have full visibility across all stores.

### Backend (Server Functions)

#### [NEW] Product Operations (`src/lib/products/products.server.ts`)
- `createProduct`: Adds a new listing to the database.
- `updateProduct`: Modifies existing product details.
- `deleteProduct`: Removes a product (or marks it as deleted).
- `toggleProductStatus`: Quickly switches between active/inactive.

#### [UPDATED] Product API (`src/lib/products/products.functions.ts`)
- Wrap the server-side operations in `createServerFn` with proper Zod validation and `requireSupabaseAuth` middleware.

### Frontend (Seller Portal)

#### [NEW] Inventory Management (`src/routes/_authenticated/business.tsx`)
- Add a "Manage Products" section to the Seller Dashboard.
- Implement a product list view showing stock, status, and pricing.
- Add a modal/form for creating and editing product listings.

## Technical Details

- **Database**: PostgreSQL (Supabase) with strict RLS.
- **Validation**: Zod for schema enforcement on all server function inputs.
- **State Management**: TanStack Query for caching and real-time updates of product listings.
- **Currency**: All pricing defaults to Zambian Kwacha (ZMW) using the `formatCurrency` utility.
