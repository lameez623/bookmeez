import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 pb-28 pt-14">
      <div className="container-editorial grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sage font-display text-sm font-bold text-ink">
              ah
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              A Helping Hand
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            Patient, personal tutoring that helps learners find their confidence
            again — one hour at a time.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-ink text-ink-soft">Home</Link></li>
            <li><Link to="/reserve" className="hover:text-ink text-ink-soft">Reserve a lesson</Link></li>
            <li><Link to="/approach" className="hover:text-ink text-ink-soft">Our approach</Link></li>
            <li><Link to="/contact" className="hover:text-ink text-ink-soft">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Get in touch
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>067 678 1266</li>
            <li>Lameez623@gmail.com</li>
            <li>Durban, South Africa</li>
          </ul>
        </div>
      </div>
      <div className="container-editorial mt-10 text-xs text-ink-soft">
        © {new Date().getFullYear()} A Helping Hand Tutoring. Made with care.
      </div>
    </footer>
  );
}
