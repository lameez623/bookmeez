import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const TIMES = ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"] as const;
const DateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export type AdminBooking = {
  id: string;
  parent_name: string;
  learner_name: string;
  grade: string;
  school: string | null;
  phone: string;
  email: string;
  subjects: string[];
  lesson_type: string;
  session_mode: string;
  lesson_date: string;
  time_slot: string;
  notes: string | null;
  status: string;
  created_at: string;
};

export type AdminBlock = {
  id: string;
  blocked_date: string;
  time_slot: string | null;
  reason: string | null;
};

type AdminClient = SupabaseClient<Database>;

async function assertAdmin(supabase: AdminClient, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: administrator access required");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ from: DateKey, to: DateKey }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("bookings")
      .select("*")
      .gte("lesson_date", data.from)
      .lte("lesson_date", data.to)
      .order("lesson_date", { ascending: true })
      .order("time_slot", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminBooking[];
  });

export const adminListBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ from: DateKey, to: DateKey }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("blocked_slots")
      .select("id, blocked_date, time_slot, reason")
      .gte("blocked_date", data.from)
      .lte("blocked_date", data.to)
      .order("blocked_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminBlock[];
  });

export const adminAddBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        blocked_date: DateKey,
        time_slot: z.enum(TIMES).nullable().optional(),
        reason: z.string().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blocked_slots").insert({
      blocked_date: data.blocked_date,
      time_slot: data.time_slot ?? null,
      reason: data.reason || null,
    });
    if (error && (error as { code?: string }).code !== "23505") {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const adminRemoveBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blocked_slots").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminCancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminRescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        lesson_date: DateKey,
        time_slot: z.enum(TIMES),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [y, m, dd] = data.lesson_date.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
    if (weekday < 1 || weekday > 4) {
      return { ok: false as const, reason: "invalid_day" as const };
    }
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const { error } = await context.supabase
      .from("bookings")
      .update({
        lesson_date: data.lesson_date,
        day_of_week: names[weekday],
        time_slot: data.time_slot,
      })
      .eq("id", data.id);
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return { ok: false as const, reason: "slot_taken" as const };
      }
      throw new Error(error.message);
    }
    return { ok: true as const };
  });
