import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { OrganicShapes } from "@/components/OrganicShapes";
import { submitEnquiry } from "@/lib/enquiries.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — A Helping Hand Tutoring" },
      {
        name: "description",
        content:
          "Reach out about tutoring in Durban and online. Phone, email, and a simple enquiry form.",
      },
      { property: "og:title", content: "Contact — A Helping Hand Tutoring" },
      { property: "og:description", content: "Chat about tutoring in Durban and online." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendEnquiry = useServerFn(submitEnquiry);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setSubmitting(true);
    try {
      await sendEnquiry({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      setSent(true);
    } catch (err) {
      console.error("[contact] enquiry submit failed", err);
      setError("Sorry, something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <PageShell>
      <section className="relative overflow-hidden pt-14 sm:pt-20">
        <OrganicShapes />
        <div className="container-editorial relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">Contact</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-6xl">
            Say hello. We'd love to hear from you.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Questions, first lessons, or just curious what to expect — we reply
            personally to every message.
          </p>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <div className="container-editorial grid gap-6 md:grid-cols-3">
          {[
            { icon: Phone, label: "Phone", value: "067 678 1266", href: "tel:+27676781266" },
            { icon: Mail, label: "Email", value: "Lameez623@gmail.com", href: "mailto:Lameez623@gmail.com" },
            { icon: MapPin, label: "Based in", value: "Durban, South Africa" },
          ].map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-soft block"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft">
                <c.icon className="h-5 w-5 text-ink" strokeWidth={1.8} />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{c.label}</p>
              <p className="mt-2 font-display text-lg font-semibold">{c.value}</p>
            </motion.a>
          ))}
        </div>

        <div className="container-editorial mt-6">
          <div className="rounded-3xl border border-apricot/60 bg-apricot-soft/60 px-6 py-5 text-sm text-ink">
            We currently offer in-person tutoring within selected areas of
            Durban. Online lessons are available everywhere.
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <div className="container-editorial grid gap-8 md:grid-cols-[1fr_1.1fr]">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-soft"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold">Send an enquiry</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Prefer a booking? Head to the{" "}
              <a href="/reserve" className="underline decoration-sage decoration-2 underline-offset-4">
                reserve page
              </a>
              .
            </p>

            {sent ? (
              <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-sage/30 bg-sage-soft/70 p-6">
                <CheckCircle2 className="h-6 w-6 text-sage" />
                <p className="font-display text-lg font-semibold">Thank you — message received.</p>
                <p className="text-sm text-ink-soft">We'll be in touch shortly.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <Field label="Your name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone (optional)" name="phone" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send message <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card"
            style={{ minHeight: 380 }}
          >
            <iframe
              title="Durban map"
              src="https://www.google.com/maps?q=Durban%2C%20South%20Africa&output=embed"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30"
      />
    </div>
  );
}
