import { z } from "zod";

const cloudinaryUrl = z
  .string()
  .url("Must be a valid image URL")
  .optional()
  .or(z.literal(""));

export const createBookSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    author: z.string().min(2, "Author name is required"),
    price: z.number().positive("Price must be greater than 0"),
    currency: z.string().default("NGN"),
    coverImage: cloudinaryUrl,
    backImage: cloudinaryUrl,
    stock: z.number().int().min(0).default(0),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    allowsDelivery: z.boolean().default(true),
    allowsPickup: z.boolean().default(true),
    pickupLocation: z.string().optional(),
  })
  .refine((data) => data.allowsDelivery || data.allowsPickup, {
    message: "Enable at least delivery or pickup",
    path: ["allowsDelivery"],
  })
  .refine(
    (data) => !data.allowsPickup || (data.pickupLocation?.trim().length ?? 0) > 0,
    {
      message: "Pickup location is required when pickup is enabled",
      path: ["pickupLocation"],
    }
  );

export const updateBookSchema = createBookSchema.partial();

export const checkoutBookSchema = z
  .object({
    bookId: z.number().int().positive(),
    fulfillmentMethod: z.enum(["DELIVERY", "PICKUP"]),
    deliveryAddress: z.string().optional(),
    deliveryCity: z.string().optional(),
    deliveryPhone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.fulfillmentMethod === "DELIVERY") {
        return (
          !!data.deliveryAddress?.trim() &&
          !!data.deliveryCity?.trim() &&
          !!data.deliveryPhone?.trim()
        );
      }
      return true;
    },
    {
      message: "Delivery address, city, and phone are required for delivery",
      path: ["deliveryAddress"],
    }
  );

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type CheckoutBookInput = z.infer<typeof checkoutBookSchema>;
