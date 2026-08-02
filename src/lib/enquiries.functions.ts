import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EnquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export type EnquiryInput = z.infer<typeof EnquirySchema>;

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => EnquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { sendDiscordNotification, field } = await import("@/lib/notifications.server");

    const delivered = await sendDiscordNotification("💬 New Enquiry Received", [
      field("Name", data.name),
      field("Email", data.email),
      field("Phone", data.phone),
      field("Message", data.message, false),
    ]);

    if (!delivered) {
      console.error("[submitEnquiry] Discord notification failed", { email: data.email });
    }

    return { ok: true as const, notified: delivered };
  });
