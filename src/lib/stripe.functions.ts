import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env['STRIPE_SECRET_KEY'];
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add it via the secrets tool.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-01-27-ac", // Using a stable version
  });
};

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
            image: z.string().optional(),
          })
        ),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data.items.map((item) => ({
        price_data: {
          currency: "zmw", // TILETA default: Zambian Kwacha
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents/subunits
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
    });

    return { url: session.url };
  });
