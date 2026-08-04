/** Elegant three-dot loading indicator — replaces spinners across the app. */
export function LoadingDots({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-current"
            style={{ animation: `bm-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
