/**
 * Booking notification dispatch (server-only).
 *
 * - WhatsApp via Twilio (through the Lovable connector gateway)
 * - Email via Resend (through the Lovable connector gateway)
 *
 * Both are fire-and-forget with bounded retries; failures are logged and never
 * break the booking itself. Called exactly once per successfully saved booking.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev";

export type BookingNotification = {
  id: string;
  parent_name: string;
  learner_name: string;
  grade: string;
  school?: string | null;
  subjects: string[];
  lesson_type: string;
  session_mode: string;
  lesson_date: string;
  day_of_week: string;
  time_slot: string;
  phone: string;
  email: string;
  notes?: string | null;
};

const OWNER_EMAIL = "lameez623@gmail.com";
/** E.164 for South Africa: 067 678 1266 */
const OWNER_WHATSAPP = "+27676781266";

function prettyDate(b: BookingNotification): string {
  const [y, m, d] = b.lesson_date.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function label(value: string): string {
  return value === "in_person"
    ? "In Person"
    : value.charAt(0).toUpperCase() + value.slice(1);
}

function buildLines(b: BookingNotification): string[] {
  const lines = [
    `Parent: ${b.parent_name}`,
    `Learner: ${b.learner_name}`,
    `Grade: ${b.grade}`,
    `Subject: ${b.subjects.join(", ")}`,
    `Lesson: ${label(b.lesson_type)}`,
    `Session: ${label(b.session_mode)}`,
    `Date: ${prettyDate(b)}`,
    `Time: ${b.time_slot}`,
    `Phone: ${b.phone}`,
    `Email: ${b.email}`,
  ];
  if (b.school) lines.splice(3, 0, `School: ${b.school}`);
  if (b.notes) lines.push(`Notes: ${b.notes}`);
  return lines;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function withRetry(
  name: string,
  bookingId: string,
  fn: () => Promise<void>,
  attempts = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /\[(408|429|5\d\d)\]/.test(message) || /network|fetch/i.test(message);
      console.error(
        `[notify:${name}] attempt ${attempt}/${attempts} failed for booking ${bookingId}: ${message}`,
      );
      if (!retryable || attempt === attempts) return;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

async function sendWhatsApp(b: BookingNotification): Promise<void> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"

  if (!lovableKey || !twilioKey || !from) {
    console.warn(
      "[notify:whatsapp] skipped — missing LOVABLE_API_KEY, TWILIO_API_KEY or TWILIO_WHATSAPP_FROM",
    );
    return;
  }

  const body = ["\u{1F4DA} New Tutoring Booking", "", ...buildLines(b)].join("\n");

  const response = await fetch(`${GATEWAY_URL}/twilio/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `whatsapp:${OWNER_WHATSAPP}`,
      From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      Body: body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Twilio request failed [${response.status}]: ${await response.text()}`);
  }
  console.info(`[notify:whatsapp] sent for booking ${b.id}`);
}

async function sendEmail(b: BookingNotification): Promise<void> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!lovableKey || !resendKey) {
    console.warn("[notify:email] skipped — missing LOVABLE_API_KEY or RESEND_API_KEY");
    return;
  }

  const from = process.env.BOOKING_EMAIL_FROM || "Bookings <onboarding@resend.dev>";
  const rows = buildLines(b)
    .map((line) => {
      const [k, ...rest] = line.split(": ");
      return `<tr><td style="padding:6px 12px 6px 0;color:#6b6b6b;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#2D2D2D;">${escapeHtml(rest.join(": "))}</td></tr>`;
    })
    .join("");

  const response = await fetch(`${GATEWAY_URL}/resend/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [OWNER_EMAIL],
      reply_to: b.email,
      subject: "New Tutoring Booking",
      html: `<div style="font-family:Arial,sans-serif;background:#FAF9F7;padding:24px;">
  <h2 style="color:#2D2D2D;margin:0 0 16px;">📚 New Tutoring Booking</h2>
  <table style="border-collapse:collapse;font-size:14px;">${rows}</table>
</div>`,
      text: ["New Tutoring Booking", "", ...buildLines(b)].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed [${response.status}]: ${await response.text()}`);
  }
  console.info(`[notify:email] sent for booking ${b.id}`);
}

/** Sends exactly one WhatsApp and one email for a saved booking. Never throws. */
export async function notifyNewBooking(b: BookingNotification): Promise<void> {
  await Promise.all([
    withRetry("whatsapp", b.id, () => sendWhatsApp(b)),
    withRetry("email", b.id, () => sendEmail(b)),
  ]);
}
