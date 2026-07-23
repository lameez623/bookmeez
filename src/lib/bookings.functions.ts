import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BookingSchema = z.object({
  parent_name: z.string().trim().min(1).max(120),
  learner_name: z.string().trim().min(1).max(120),
  grade: z.string().trim().min(1).max(40),
  school: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
  subjects: z.array(z.string().min(1).max(60)).min(1).max(10),
  lesson_type: z.enum(["individual", "group"]),
  session_mode: z.enum(["online", "in_person"]),
  day_of_week: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday"]),
  time_slot: z.enum(["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof BookingSchema>;

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        parent_name: data.parent_name,
        learner_name: data.learner_name,
        grade: data.grade,
        school: data.school || null,
        phone: data.phone,
        email: data.email,
        subjects: data.subjects,
        lesson_type: data.lesson_type,
        session_mode: data.session_mode,
        day_of_week: data.day_of_week,
        time_slot: data.time_slot,
        notes: data.notes || null,
      })
      .select("id")
      .single();

    if (error) {
      // 23505 = unique_violation -> slot already booked
      if ((error as { code?: string }).code === "23505") {
        return { ok: false as const, reason: "slot_taken" as const };
      }
      console.error("[createBooking] insert failed", error);
      throw new Error("Could not save booking");
    }

    // Fire-and-forget notification (best effort). Email sending can be wired up
    // once an email domain is configured; for now we log server-side so the
    // owner has a paper-trail alongside the DB row.
    console.info("[booking] new reservation", {
      id: inserted.id,
      to: "Lameez623@gmail.com",
      parent: data.parent_name,
      learner: data.learner_name,
      grade: data.grade,
      subjects: data.subjects,
      lesson_type: data.lesson_type,
      session_mode: data.session_mode,
      day: data.day_of_week,
      time: data.time_slot,
      contact: { email: data.email, phone: data.phone },
      notes: data.notes,
    });

    return { ok: true as const, id: inserted.id };
  });

export const getBookedSlots = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("get_booked_slots");
  if (error) {
    console.error("[getBookedSlots] rpc failed", error);
    return [] as Array<{ day_of_week: string; time_slot: string }>;
  }
  return (data ?? []) as Array<{ day_of_week: string; time_slot: string }>;
});
