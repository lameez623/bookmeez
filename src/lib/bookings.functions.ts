import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TIMES = ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"] as const;

const BookingSchema = z.object({
  parent_name: z.string().trim().min(1).max(120),
  learner_name: z.string().trim().min(1).max(120),
  grade: z.string().trim().min(1).max(40),
  school: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
  subjects: z.array(z.string().min(1).max(60)).min(1).max(12),
  lesson_type: z.enum(["individual", "group"]),
  session_mode: z.enum(["online", "in_person"]),
  lesson_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot: z.enum(TIMES),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof BookingSchema>;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => BookingSchema.parse(data))
  .handler(async ({ data }) => {
    const [y, m, d] = data.lesson_date.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const weekdayIndex = date.getUTCDay();

    if (weekdayIndex < 1 || weekdayIndex > 4) {
      return { ok: false as const, reason: "invalid_day" as const };
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    if (data.lesson_date < todayKey) {
      return { ok: false as const, reason: "past_date" as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Administrator blocks (whole day or a single slot)
    const { data: blocks } = await supabaseAdmin
      .from("blocked_slots")
      .select("time_slot")
      .eq("blocked_date", data.lesson_date);

    if (
      (blocks ?? []).some((b) => b.time_slot === null || b.time_slot === data.time_slot)
    ) {
      return { ok: false as const, reason: "blocked" as const };
    }

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
        lesson_date: data.lesson_date,
        day_of_week: WEEKDAYS[weekdayIndex],
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

    // Booking is saved. Notify Discord exactly once; failures never undo the booking.
    const { sendDiscordNotification, field } = await import("@/lib/notifications.server");

    const notified = await sendDiscordNotification("📚 New Tutoring Booking", [
      field("Parent", data.parent_name),
      field("Learner", data.learner_name),
      field("Grade", data.grade),
      field("School", data.school),
      field("Subjects", data.subjects.join(", "), false),
      field("Lesson type", data.lesson_type),
      field("Session mode", data.session_mode),
      field("Lesson date", data.lesson_date),
      field("Day", WEEKDAYS[weekdayIndex]),
      field("Time slot", data.time_slot),
      field("Phone", data.phone),
      field("Email", data.email),
      field("Notes", data.notes, false),
      field("Booking ID", inserted.id, false),
    ]);

    if (!notified) {
      console.error("[createBooking] Discord notification failed for booking", inserted.id);
    }

    return { ok: true as const, id: inserted.id };
  });

export type AvailabilityRow = {
  lesson_date: string;
  time_slot: string | null;
  kind: string;
};

export const getAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data, error } = await supabase.rpc("get_availability");
  if (error) {
    console.error("[getAvailability] rpc failed", error);
    return [] as AvailabilityRow[];
  }
  return (data ?? []) as AvailabilityRow[];
});
