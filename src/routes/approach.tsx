import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Sparkles, Clock, BookOpen, GraduationCap } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OrganicShapes } from "@/components/OrganicShapes";

export const Route = createFileRoute("/approach")({
  head: () => ({
    meta: [
      { title: "Our Approach — A Helping Hand Tutoring" },
      {
        name: "description",
        content:
          "Why confidence matters, why one-hour lessons work, and how every lesson is shaped around your learner.",
      },
      { property: "og:title", content: "Our Approach — A Helping Hand Tutoring" },
      { property: "og:description", content: "Patient, personalised tutoring built around each learner." },
    ],
  }),
  component: Approach,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const pillars = [
  {
    icon: Heart,
    title: "Learning matters",
    body:
      "School shapes how a young person sees themselves. When lessons feel possible, everything else follows — motivation, curiosity, self-belief.",
  },
  {
    icon: Sparkles,
    title: "Confidence matters more",
    body:
      "We spend as much time rebuilding belief as we do reviewing content. A learner who trusts themselves will always outrun one who's afraid to try.",
  },
  {
    icon: Clock,
    title: "Why one-hour lessons work",
    body:
      "Long enough to make real progress, short enough to stay focused. Each lesson has a rhythm: warm-up, deep work, review, and a small win to end on.",
  },
  {
    icon: BookOpen,
    title: "Personalised, always",
    body:
      "No two learners are the same. We adapt to how your child thinks, what they enjoy, and where they get stuck — never the other way around.",
  },
];

function Approach() {
  return (
    <PageShell>
      <section className="relative overflow-hidden pt-14 sm:pt-20">
        <OrganicShapes />
        <div className="container-editorial relative max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-sage"
          >
            Our approach
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl font-bold leading-[1.05] sm:text-6xl"
          >
            Learning is quieter, slower, and more human than most people think.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl"
          >
            Our lessons are built for children who need someone in their corner
            — patient, prepared, and genuinely interested in how they think.
          </motion.p>
        </div>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="container-editorial grid gap-6 md:grid-cols-2">
          {pillars.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="card-soft"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft">
                <p.icon className="h-5 w-5 text-ink" strokeWidth={1.8} />
              </span>
              <h2 className="mt-5 text-2xl font-bold">{p.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="container-editorial grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">English speciality</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              English is where we shine — and where confidence quietly returns.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              From comprehension and creative writing to grammar, essays and
              exam prep, we help learners find their voice on the page. And
              because so much of school life sits on top of English, that
              confidence tends to spill into every other subject.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              We also warmly support learners across Mathematics, Natural
              Sciences, Life Sciences, Afrikaans, History, Geography and more —
              whatever your learner is quietly wrestling with.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="card-soft"
          >
            <GraduationCap className="h-8 w-8 text-sage" strokeWidth={1.8} />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">About the founder</p>
            <h3 className="mt-2 text-2xl font-bold">A future teacher, learning alongside you.</h3>
            <p className="mt-4 leading-relaxed text-ink-soft">
              A Helping Hand is led by a passionate Bachelor of Teaching
              student, committed to helping learners grow academically without
              the pressure. The classroom is a training ground — every lesson
              is a chance to serve the learner in front of us.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative overflow-hidden rounded-[2.25rem] px-6 py-10 sm:px-12 sm:py-14"
          >
            <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-sage-soft font-display text-xl font-bold text-ink">
                  L
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">About me</p>
                  <p className="mt-1 font-display text-lg font-semibold">Lameez</p>
                </div>
              </div>

              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                  Hi, I'm Lameez — a lifelong student who never quite grew out
                  of asking "but why?"
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
                  <p>
                    I'm currently studying a Bachelor of Arts, majoring in
                    English, which is a polite way of saying I get to spend my
                    days reading, arguing about commas and falling in love with
                    the way words carry people. I've always found something
                    quietly thrilling in the moment a difficult idea finally
                    clicks — that little pause, then the grin.
                  </p>
                  <p>
                    I don't think learning should feel like a test of whether
                    you're clever enough. I think it should build you up. Most
                    of the learners I meet aren't struggling because they can't
                    — they're struggling because somewhere along the way,
                    someone made them believe they can't. Watching that belief
                    turn around is the part of this work I'd do for free (don't
                    tell anyone).
                  </p>
                  <p>
                    Every learner arrives wired a little differently, so half
                    the fun is detective work: finding the explanation, the
                    example or the odd analogy that makes it land for that one
                    person. Curiosity, I'm convinced, is one of life's greatest
                    superpowers — cheaper than a degree and twice as useful.
                  </p>
                  <p>
                    One day I want to see as much of this world as it will let
                    me: different countries, different classrooms, different
                    ways of thinking — trading what I know for what I don't,
                    everywhere I go.
                  </p>
                  <p className="font-display text-xl font-semibold text-ink">
                    Come curious, and let's find out together how much more
                    you're capable of than you think.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
}
