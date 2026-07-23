import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  User,
  Laptop,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OrganicShapes } from "@/components/OrganicShapes";
import { createBooking, getBookedSlots } from "@/lib/bookings.functions";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a Lesson — A Helping Hand Tutoring" },
      {
        name: "description",
        content:
          "Book a warm, one-hour tutoring session online or in Durban. English speciality plus most school subjects.",
      },
      { property: "og:title", content: "Reserve a Lesson — A Helping Hand" },
      { property: "og:description", content: "Book a one-hour tutoring session in three gentle steps." },
    ],
  }),
  component: Reserve,
});

type Grade = "Grade R" | "Grade 1" | "Grade 2" | "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6" | "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
const GRADES: Grade[] = [
  "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

const SUBJECTS = [
  "English",
  "Mathematics",
  "Afrikaans",
  "Natural Sciences",
  "Life Sciences",
  "Physical Sciences",
  "History",
  "Geography",
  "Life Orientation",
  "Business Studies",
] as const;
type Subject = (typeof SUBJECTS)[number];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday"] as const;
type Day = (typeof DAYS)[number];

const TIMES = ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"] as const;
type Time = (typeof TIMES)[number];

type LessonType = "individual" | "group";
type SessionMode = "online" | "in_person";

interface BookingState {
  grade: Grade | null;
  subjects: Subject[];
  lesson_type: LessonType | null;
  session_mode: SessionMode | null;
  day: Day | null;
  time: Time | null;
  parent_name: string;
  learner_name: string;
  school: string;
  phone: string;
  email: string;
  notes: string;
}

const initialState: BookingState = {
  grade: null,
  subjects: [],
  lesson_type: null,
  session_mode: null,
  day: null,
  time: null,
  parent_name: "",
  learner_name: "",
  school: "",
  phone: "",
  email: "",
  notes: "",
};

const STEP_LABELS = [
  "Grade",
  "Subjects",
  "Lesson type",
  "Session",
  "Day",
  "Time",
  "Your details",
];

function Reserve() {
  const [step, setStep] = useState(0); // 0..6 form, 7 = confirmation
  const [state, setState] = useState<BookingState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchBooked = useServerFn(getBookedSlots);
  const submit = useServerFn(createBooking);

  const bookedQuery = useQuery({
    queryKey: ["booked-slots"],
    queryFn: () => fetchBooked(),
    staleTime: 30_000,
  });

  const bookedSet = useMemo(() => {
    const s = new Set<string>();
    (bookedQuery.data ?? []).forEach((b) => s.add(`${b.day_of_week}__${b.time_slot}`));
    return s;
  }, [bookedQuery.data]);

  const totalSteps = STEP_LABELS.length;
  const progress = Math.min(100, ((step) / totalSteps) * 100);

  const canNext = (() => {
    switch (step) {
      case 0: return !!state.grade;
      case 1: return state.subjects.length > 0;
      case 2: return !!state.lesson_type;
      case 3: return !!state.session_mode;
      case 4: return !!state.day;
      case 5: return !!state.time;
      case 6: return (
        state.parent_name.trim().length > 0 &&
        state.learner_name.trim().length > 0 &&
        state.phone.trim().length >= 6 &&
        /.+@.+\..+/.test(state.email.trim())
      );
      default: return false;
    }
  })();

  async function handleSubmit() {
    if (!canNext || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submit({
        data: {
          parent_name: state.parent_name.trim(),
          learner_name: state.learner_name.trim(),
          grade: state.grade!,
          school: state.school.trim(),
          phone: state.phone.trim(),
          email: state.email.trim(),
          subjects: state.subjects,
          lesson_type: state.lesson_type!,
          session_mode: state.session_mode!,
          day_of_week: state.day!,
          time_slot: state.time!,
          notes: state.notes.trim(),
        },
      });
      if (!result.ok) {
        setError(
          "That time was just booked. Please pick another slot — we've refreshed availability.",
        );
        await bookedQuery.refetch();
        setStep(5);
      } else {
        setStep(7);
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden pt-14 sm:pt-20">
        <OrganicShapes />
        <div className="container-editorial relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">
            Reserve a lesson
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-6xl">
            {step === 7 ? "You're booked in." : "Let's find a calm hour for your learner."}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            {step === 7
              ? "Thank you — we'll be in touch with a confirmation shortly."
              : "Seven small steps. No pressure — you can go back at any time."}
          </p>
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <div className="container-editorial max-w-3xl">
          {/* Progress */}
          {step < 7 && (
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-soft">
                <span>Step {step + 1} of {totalSteps} — {STEP_LABELS[step]}</span>
                <span>{Math.round(progress + (100 / totalSteps))}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
                <motion.div
                  className="h-full rounded-full bg-sage"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress + 100 / totalSteps}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                />
              </div>
            </div>
          )}

          <div className="card-soft relative min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              >
                {step === 0 && (
                  <StepGrid label="Which grade is your learner in?">
                    {GRADES.map((g) => (
                      <Chip
                        key={g}
                        selected={state.grade === g}
                        onClick={() => setState({ ...state, grade: g })}
                      >
                        {g}
                      </Chip>
                    ))}
                  </StepGrid>
                )}

                {step === 1 && (
                  <StepGrid
                    label="What subjects would you like support with?"
                    hint="English first — you can pick more than one."
                  >
                    {SUBJECTS.map((s) => {
                      const selected = state.subjects.includes(s);
                      return (
                        <Chip
                          key={s}
                          selected={selected}
                          onClick={() =>
                            setState({
                              ...state,
                              subjects: selected
                                ? state.subjects.filter((x) => x !== s)
                                : [...state.subjects, s],
                            })
                          }
                        >
                          {s}
                        </Chip>
                      );
                    })}
                  </StepGrid>
                )}

                {step === 2 && (
                  <StepGrid label="Individual or small group?">
                    <BigOption
                      icon={User}
                      title="Individual"
                      body="One-on-one focus, tailored to your learner."
                      selected={state.lesson_type === "individual"}
                      onClick={() => setState({ ...state, lesson_type: "individual" })}
                    />
                    <BigOption
                      icon={Users}
                      title="Group"
                      body="Small friendly group — great for shared subjects."
                      selected={state.lesson_type === "group"}
                      onClick={() => setState({ ...state, lesson_type: "group" })}
                    />
                  </StepGrid>
                )}

                {step === 3 && (
                  <StepGrid label="Online or in person?">
                    <BigOption
                      icon={Laptop}
                      title="Online"
                      body="From anywhere — friendly, focused video lessons."
                      selected={state.session_mode === "online"}
                      onClick={() => setState({ ...state, session_mode: "online" })}
                    />
                    <BigOption
                      icon={MapPin}
                      title="In person"
                      body="Face-to-face lessons — quiet, calm setting."
                      selected={state.session_mode === "in_person"}
                      onClick={() => setState({ ...state, session_mode: "in_person" })}
                    />
                    {state.session_mode === "in_person" && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full mt-2 rounded-2xl border border-apricot/60 bg-apricot-soft/60 px-5 py-4 text-sm text-ink"
                      >
                        In-person lessons are available only within selected
                        Durban areas.
                      </motion.p>
                    )}
                  </StepGrid>
                )}

                {step === 4 && (
                  <StepGrid label="Which day works best?">
                    {DAYS.map((d) => (
                      <Chip
                        key={d}
                        selected={state.day === d}
                        onClick={() => setState({ ...state, day: d, time: null })}
                      >
                        {d}
                      </Chip>
                    ))}
                  </StepGrid>
                )}

                {step === 5 && (
                  <StepGrid
                    label="Pick a one-hour slot"
                    hint={state.day ? `Available times on ${state.day}` : ""}
                  >
                    {TIMES.map((t) => {
                      const disabled = state.day
                        ? bookedSet.has(`${state.day}__${t}`)
                        : true;
                      return (
                        <Chip
                          key={t}
                          selected={state.time === t}
                          disabled={disabled}
                          onClick={() => !disabled && setState({ ...state, time: t })}
                        >
                          {t}
                          {disabled && (
                            <span className="ml-2 text-xs text-ink-soft">booked</span>
                          )}
                        </Chip>
                      );
                    })}
                  </StepGrid>
                )}

                {step === 6 && (
                  <div>
                    <h2 className="font-display text-2xl font-bold">Your details</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      So we can confirm and prepare for the lesson.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <Text label="Parent name" value={state.parent_name}
                        onChange={(v) => setState({ ...state, parent_name: v })} required />
                      <Text label="Learner name" value={state.learner_name}
                        onChange={(v) => setState({ ...state, learner_name: v })} required />
                      <Text label="Grade" value={state.grade ?? ""} readOnly />
                      <Text label="School (optional)" value={state.school}
                        onChange={(v) => setState({ ...state, school: v })} />
                      <Text label="Phone" value={state.phone} type="tel"
                        onChange={(v) => setState({ ...state, phone: v })} required />
                      <Text label="Email" value={state.email} type="email"
                        onChange={(v) => setState({ ...state, email: v })} required />
                    </div>
                    <div className="mt-4">
                      <label className="mb-1.5 block text-sm font-medium">Notes (optional)</label>
                      <textarea
                        rows={4}
                        value={state.notes}
                        onChange={(e) => setState({ ...state, notes: e.target.value })}
                        placeholder="Anything you'd like us to know?"
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30"
                      />
                    </div>

                    <Summary state={state} />

                    {error && (
                      <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                      </p>
                    )}
                  </div>
                )}

                {step === 7 && (
                  <ConfirmationCard state={state} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {step < 7 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="btn-ghost disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < 6 ? (
                <button
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canNext || submitting}
                  className="btn-primary disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Reserving…
                    </>
                  ) : (
                    <>
                      Reserve my lesson <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

/* ---------- small building blocks ---------- */

function StepGrid({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{label}</h2>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">{children}</div>
    </div>
  );
}

function Chip({
  children,
  selected,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={[
        "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all",
        selected
          ? "border-ink bg-ink text-primary-foreground shadow-sm"
          : "border-border bg-background text-ink hover:border-sage/60",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

function BigOption({
  icon: Icon,
  title,
  body,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      className={[
        "flex items-start gap-4 rounded-3xl border p-5 text-left transition-all",
        selected ? "border-ink bg-ink/[0.03] ring-2 ring-sage/40" : "border-border bg-background hover:border-sage/60",
      ].join(" ")}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft">
        <Icon className="h-5 w-5 text-ink" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-ink-soft">{body}</span>
      </span>
    </motion.button>
  );
}

function Text({
  label,
  value,
  onChange,
  type = "text",
  required,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30 read-only:bg-muted/60 read-only:text-ink-soft"
      />
    </div>
  );
}

function Summary({ state }: { state: BookingState }) {
  return (
    <div className="mt-8 rounded-3xl border border-border bg-secondary/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">Booking summary</p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SumItem k="Grade" v={state.grade ?? "—"} />
        <SumItem k="Subjects" v={state.subjects.join(", ") || "—"} />
        <SumItem k="Lesson type" v={state.lesson_type === "individual" ? "Individual" : state.lesson_type === "group" ? "Group" : "—"} />
        <SumItem k="Session" v={state.session_mode === "online" ? "Online" : state.session_mode === "in_person" ? "In person" : "—"} />
        <SumItem k="Day" v={state.day ?? "—"} />
        <SumItem k="Time" v={state.time ?? "—"} />
      </dl>
    </div>
  );
}

function SumItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft">{k}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
    </div>
  );
}

function ConfirmationCard({ state }: { state: BookingState }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 18 }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/25"
      >
        <CheckCircle2 className="h-8 w-8 text-sage" />
      </motion.div>
      <h2 className="mt-6 font-display text-3xl font-bold">Thank you, {state.parent_name.split(" ")[0] || "friend"}.</h2>
      <p className="mt-3 text-ink-soft">
        We've received your reservation for <b>{state.learner_name}</b>. You'll get a confirmation shortly.
      </p>
      <div className="mt-8 grid gap-3 rounded-3xl border border-border bg-secondary/60 p-5 text-left sm:grid-cols-2">
        <SumItem k="Grade" v={state.grade ?? "—"} />
        <SumItem k="Subjects" v={state.subjects.join(", ")} />
        <SumItem k="Day" v={state.day ?? "—"} />
        <SumItem k="Time" v={state.time ?? "—"} />
        <SumItem k="Session" v={state.session_mode === "online" ? "Online" : "In person"} />
        <SumItem k="Lesson type" v={state.lesson_type === "individual" ? "Individual" : "Group"} />
      </div>
    </motion.div>
  );
}
