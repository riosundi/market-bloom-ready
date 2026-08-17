# Marketplace Database Expansion Plan

Expand the Supabase schema to include specialized tables for marketplace operations, financials, and platform management, while maintaining existing RLS standards and role-based access.

## Proposed Changes

### 1. Database Schema (`supabase/migrations`)

Create a new migration file to implement the requested tables:

- **Categories**: Centralize category management (replaces/augments existing hardcoded `CATEGORIES`).
- **Product Images**: Support multiple images per product.
- **Inventory**: Detailed stock tracking (per variant/location if needed, initially simple).
- **Payments**: Track external and internal payment transactions.
- **Withdrawals**: For sellers and agents to cash out earnings.
- **Transactions**: Unified ledger for all wallet movements (orders, top-ups, withdrawals).
- **Platform Settings**: Dynamic configuration (fees, maintenance mode, featured categories).

### 2. Implementation Details

- **categories**: `id`, `name`, `slug`, `icon`, `description`, `is_active`.
- **product_images**: `id`, `product_id`, `image_url`, `alt_text`, `is_primary`, `sort_order`.
- **inventory**: `id`, `product_id`, `quantity`, `last_restock_date`, `low_stock_threshold`.
- **payments**: `id`, `order_id`, `amount`, `payment_method`, `status`, `provider_reference`.
- **withdrawals**: `id`, `user_id`, `amount`, `status`, `payout_method`, `requested_at`, `processed_at`.
- **transactions**: `id`, `user_id`, `amount`, `type` (debit/credit), `description`, `reference_type`, `reference_id`.
- **platform_settings**: `key` (PK), `value` (JSONB), `description`, `updated_at`.

### 3. Security (RLS)

- **Withdrawals/Transactions**: Strict `auth.uid() = user_id` for users; `admin` role has full access.
- **Payments**: Linked to order visibility.
- **Platform Settings**: Read-only for `authenticated`; write-only for `admin`.
- **Categories**: Public read; `admin` write.

## User Review Required

> [!IMPORTANT]
> I will implement these tables using Supabase migrations. The "users", "admins", and "sellers" tables already exist conceptually as `profiles` + `user_roles` + `businesses`. I will ensure the new tables reference these correctly.

- Do you have specific payment providers (e.g. Airtel Money, MTN, FNB) you want to pre-configure in the `withdrawals` payout methods?
- For `inventory`, should we track history (restock logs) or just the current state?
