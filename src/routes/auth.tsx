import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OrganicShapes } from "@/components/OrganicShapes";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In — A Helping Hand Tutoring" },
      {
        name: "description",
        content: "Private sign in for the A Helping Hand Tutoring booking calendar.",
      },
      { property: "og:title", content: "Administrator Sign In — A Helping Hand" },
      { property: "og:description", content: "Private administrator access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setMessage("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden pt-14 sm:pt-20">
        <OrganicShapes />
        <div className="container-editorial relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage">
            Private access
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05]">Administrator sign in</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            This area is for managing the tutoring calendar.
          </p>
        </div>
      </section>

      <section className="mt-12 sm:mt-16">
        <div className="container-editorial max-w-md">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
            className="glass-panel glass-sheen p-7 sm:p-9"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-soft">
              <Lock className="h-5 w-5 text-ink" strokeWidth={1.8} />
            </span>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-sage focus:ring-2 focus:ring-sage/30"
                />
              </div>
            </div>

            {message && (
              <p className="mt-4 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-ink-soft">
                {message}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary mt-6 w-full justify-center disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full text-center text-sm text-ink-soft underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an administrator account" : "I already have an account"}
            </button>
          </motion.form>
        </div>
      </section>
    </PageShell>
  );
}
