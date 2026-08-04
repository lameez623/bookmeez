import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Ban, CalendarDays, Loader2, LogOut, Trash2, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS, toDateKey, formatDateLong } from "@/lib/booking-constants";
import {
  adminAddBlock,
  adminCancelBooking,
  adminListBlocks,
  adminListBookings,
  adminRemoveBlock,
  adminRescheduleBooking,
  amIAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Booking Calendar — A Helping Hand Tutoring" },
      { name: "description", content: "Private administrator calendar for tutoring bookings." },
      { property: "og:title", content: "Booking Calendar — A Helping Hand" },
      { property: "og:description", content: "Private administrator calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCalendar,
});

type View = "day" | "week" | "month";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday start
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function AdminCalendar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState<string>(TIME_SLOTS[0]);

  const checkAdmin = useServerFn(amIAdmin);
  const listBookings = useServerFn(adminListBookings);
  const listBlocks = useServerFn(adminListBlocks);
  const addBlock = useServerFn(adminAddBlock);
  const removeBlock = useServerFn(adminRemoveBlock);
  const cancelBooking = useServerFn(adminCancelBooking);
  const reschedule = useServerFn(adminRescheduleBooking);

  const adminQuery = useQuery({ queryKey: ["am-i-admin"], queryFn: () => checkAdmin() });

  const range = useMemo(() => {
    if (view === "day") {
      const k = toDateKey(anchor);
      return { from: k, to: k };
    }
    if (view === "week") {
      const s = startOfWeek(anchor);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      return { from: toDateKey(s), to: toDateKey(e) };
    }
    const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { from: toDateKey(s), to: toDateKey(e) };
  }, [view, anchor]);

  const enabled = adminQuery.data?.isAdmin === true;

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings", range.from, range.to],
    queryFn: () => listBookings({ data: range }),
    enabled,
  });

  const blocksQuery = useQuery({
    queryKey: ["admin-blocks", range.from, range.to],
    queryFn: () => listBlocks({ data: range }),
    enabled,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-blocks"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const [blockDate, setBlockDate] = useState<Date | undefined>(undefined);
  const [blockSlot, setBlockSlot] = useState<string>("whole-day");

  async function handleBlock() {
    if (!blockDate) return;
    setBusy("block");
    setNote(null);
    try {
      await addBlock({
        data: {
          blocked_date: toDateKey(blockDate),
          time_slot: blockSlot === "whole-day" ? null : (blockSlot as (typeof TIME_SLOTS)[number]),
        },
      });
      refresh();
      setNote("Block saved.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not save block.");
    } finally {
      setBusy(null);
    }
  }

  if (adminQuery.isLoading) {
    return (
      <PageShell>
        <div className="container-editorial flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-sage" />
        </div>
      </PageShell>
    );
  }

  if (!enabled) {
    return (
      <PageShell>
        <section className="pt-14 sm:pt-20">
          <div className="container-editorial max-w-xl">
            <h1 className="text-3xl font-bold">Administrator access required</h1>
            <p className="mt-4 text-ink-soft">
              This account is signed in but has not been granted administrator access to the
              booking calendar.
            </p>
            <button onClick={handleSignOut} className="btn-ghost mt-6">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  const bookings = (bookingsQuery.data ?? []).filter((b) => b.status === "confirmed");
  const cancelled = (bookingsQuery.data ?? []).filter((b) => b.status !== "confirmed");
  const blocks = blocksQuery.data ?? [];

  return (
    <PageShell>
      <section className="pt-14 sm:pt-20">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">
                Administrator
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.05]">Booking calendar</h1>
            </div>
            <button onClick={handleSignOut} className="btn-ghost">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="container-editorial space-y-6">
          {/* View switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-full border border-border bg-background p-1">
              {(["day", "week", "month"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                    view === v ? "bg-ink text-primary-foreground" : "text-ink-soft hover:text-ink",
                  ].join(" ")}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn-ghost"
                onClick={() => {
                  const d = new Date(anchor);
                  if (view === "day") d.setDate(d.getDate() - 1);
                  else if (view === "week") d.setDate(d.getDate() - 7);
                  else d.setMonth(d.getMonth() - 1);
                  setAnchor(d);
                }}
              >
                Previous
              </button>
              <button className="btn-ghost" onClick={() => setAnchor(new Date())}>
                Today
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  const d = new Date(anchor);
                  if (view === "day") d.setDate(d.getDate() + 1);
                  else if (view === "week") d.setDate(d.getDate() + 7);
                  else d.setMonth(d.getMonth() + 1);
                  setAnchor(d);
                }}
              >
                Next
              </button>
            </div>
            <p className="text-sm text-ink-soft">
              {formatDateLong(range.from)} — {formatDateLong(range.to)}
            </p>
          </div>

          {/* Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            className="card-soft"
          >
            <h2 className="font-display text-2xl font-bold">Confirmed bookings</h2>
            {bookingsQuery.isLoading ? (
              <div className="mt-4 space-y-3">
                <div className="skeleton-soft h-16 w-full" />
                <div className="skeleton-soft h-16 w-full" />
                <div className="skeleton-soft h-16 w-full" />
              </div>
            ) : null}
            {false ? (
              <p className="mt-4 text-sm text-ink-soft">Loading…</p>
            ) : bookings.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">No bookings in this period.</p>
            ) : (
              <ul className="mt-6 space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-3xl border border-border bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-semibold">
                          {b.learner_name} · {b.grade}
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {formatDateLong(b.lesson_date)} at {b.time_slot}
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">
                          {b.subjects.join(", ")} ·{" "}
                          {b.lesson_type === "individual" ? "Individual" : "Group"} ·{" "}
                          {b.session_mode === "online" ? "Online" : "In person"}
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">
                          {b.parent_name} — {b.phone} — {b.email}
                        </p>
                        {b.notes && <p className="mt-2 text-sm text-ink-soft">“{b.notes}”</p>}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            setRescheduling(rescheduling === b.id ? null : b.id);
                            setRescheduleDate(b.lesson_date);
                            setRescheduleTime(b.time_slot);
                          }}
                        >
                          <CalendarDays className="h-4 w-4" /> Reschedule
                        </button>
                        <button
                          className="btn-ghost"
                          disabled={busy === b.id}
                          onClick={async () => {
                            setBusy(b.id);
                            await cancelBooking({ data: { id: b.id } });
                            refresh();
                            setBusy(null);
                          }}
                        >
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>

                    {rescheduling === b.id && (
                      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">New date</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/30"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">New time</label>
                          <select
                            value={rescheduleTime}
                            onChange={(e) => setRescheduleTime(e.target.value)}
                            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/30"
                          >
                            {TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          className="btn-primary"
                          disabled={busy === `r-${b.id}`}
                          onClick={async () => {
                            setBusy(`r-${b.id}`);
                            setNote(null);
                            const res = await reschedule({
                              data: {
                                id: b.id,
                                lesson_date: rescheduleDate,
                                time_slot: rescheduleTime as (typeof TIME_SLOTS)[number],
                              },
                            });
                            if (!res.ok) {
                              setNote(
                                res.reason === "slot_taken"
                                  ? "That slot is already taken."
                                  : "Lessons run Monday to Thursday only.",
                              );
                            } else {
                              setRescheduling(null);
                              refresh();
                            }
                            setBusy(null);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {cancelled.length > 0 && (
              <p className="mt-6 text-sm text-ink-soft">
                {cancelled.length} cancelled booking{cancelled.length > 1 ? "s" : ""} in this
                period.
              </p>
            )}
          </motion.div>

          {/* Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] as const }}
            className="card-soft"
          >
            <h2 className="font-display text-2xl font-bold">Block availability</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Blocked dates and slots are removed from the public booking calendar.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Calendar
                mode="single"
                selected={blockDate}
                onSelect={setBlockDate}
                className="pointer-events-auto rounded-3xl border border-border bg-background p-3"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">What to block</label>
                <select
                  value={blockSlot}
                  onChange={(e) => setBlockSlot(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/30"
                >
                  <option value="whole-day">Whole day</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBlock}
                  disabled={!blockDate || busy === "block"}
                  className="btn-primary mt-4 disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" /> Block
                </button>
                {note && <p className="mt-3 text-sm text-ink-soft">{note}</p>}
              </div>
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Current blocks in view
            </h3>
            {blocks.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Nothing blocked in this period.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {blocks.map((bl) => (
                  <li
                    key={bl.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                  >
                    <span>
                      {formatDateLong(bl.blocked_date)} —{" "}
                      {bl.time_slot ? bl.time_slot : "whole day"}
                    </span>
                    <button
                      className="btn-ghost"
                      onClick={async () => {
                        await removeBlock({ data: { id: bl.id } });
                        refresh();
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
