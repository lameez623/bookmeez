import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarCheck, Sparkles, Heart, Clock, MessageCircle, MapPin, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OrganicShapes } from "@/components/OrganicShapes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Helping Hand — Patient, personal tutoring" },
      {
        name: "description",
        content:
          "Helping learners build confidence, improve their marks and enjoy learning again. English speciality with support across most school subjects.",
      },
      { property: "og:title", content: "A Helping Hand — Patient, personal tutoring" },
      { property: "og:description", content: "Helping learners build confidence, improve their marks and enjoy learning again. English speciality with support across most school subjects." },
    ],
  }),
  component: Home,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 sm:pt-20">
        <OrganicShapes />
        <div className="container-editorial relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-ink-soft backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              Now taking bookings for the new term
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            >
              Helping learners build{" "}
              <span className="relative inline-block">
                confidence
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-3 rounded-full bg-apricot/70"
                  style={{ zIndex: -1 }}
                />
              </span>
              , improve their marks, and enjoy learning again.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl"
            >
              Patient, one-on-one support in structured one-hour lessons. We
              celebrate progress, explain things gently, and make learning feel
              achievable again.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
              <Link to="/reserve" className="btn-primary">
                Reserve a lesson <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/approach" className="btn-ghost">Learn more</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="mt-28 sm:mt-40">
        <div className="container-editorial grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">
              Why we exist
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              This isn't about making money. It's about helping learners believe
              in themselves again.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Every learner deserves someone who explains things patiently,
              celebrates small wins, and stays hopeful with them. English is our
              speciality — and we warmly welcome learners who need help across
              almost any school subject.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative"
          >
            <div className="card-soft relative overflow-hidden">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-apricot/50 blur-2xl" />
              <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-sage/40 blur-2xl" />
              <div className="relative">
                <Heart className="h-8 w-8 text-sage" strokeWidth={1.8} />
                <p className="mt-6 font-display text-xl leading-relaxed">
                  "The best lessons don't feel like lessons. They feel like a
                  quiet conversation with someone who genuinely believes in
                  you."
                </p>
                <p className="mt-6 text-sm text-ink-soft">— Our teaching promise</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-28 sm:mt-40">
        <div className="container-editorial">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">How it works</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              Three gentle steps to your first lesson.
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "Choose a subject", body: "Start with English or pick from most school subjects, at any grade." },
              { icon: CalendarCheck, title: "Reserve a lesson", body: "Pick a day and a one-hour slot that fits your week." },
              { icon: Sparkles, title: "Start learning", body: "Meet online or in person and watch confidence quietly return." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                className="card-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-soft">
                  <s.icon className="h-5 w-5 text-ink" strokeWidth={1.8} />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-ink-soft leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why parents choose us */}
      <section className="mt-28 sm:mt-40">
        <div className="container-editorial">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">Why parents choose us</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              Thoughtful details that make learning feel calmer.
            </h2>
          </motion.div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart, t: "Patient learning environment" },
              { icon: Sparkles, t: "Personalised support" },
              { icon: MapPin, t: "Online & in-person sessions" },
              { icon: Clock, t: "One-hour focused lessons" },
              { icon: GraduationCap, t: "Designed around the learner" },
              { icon: MessageCircle, t: "Professional communication" },
              { icon: CalendarCheck, t: "Flexible scheduling" },
            ].map((f, i) => (
              <motion.li
                key={f.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-3xl border border-border/70 bg-card px-5 py-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-apricot-soft">
                  <f.icon className="h-4 w-4 text-ink" strokeWidth={1.8} />
                </span>
                <span className="text-sm font-medium">{f.t}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 sm:mt-40">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card px-8 py-14 sm:px-14 sm:py-20"
          >
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-apricot/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sage/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
                Ready to see your learner smile about school again?
              </h2>
              <p className="mt-5 text-lg text-ink-soft">
                Reserve a one-hour lesson — we'll take it from there.
              </p>
              <Link to="/reserve" className="btn-primary mt-8">
                Reserve your first lesson <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
