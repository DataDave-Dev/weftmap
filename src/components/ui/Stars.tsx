function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9 6.2 20.9l1.1-6.47-4.7-4.58 6.5-.95z" />
    </svg>
  );
}

// Read-only star rating display.
export default function Stars({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400 ${className}`}
      aria-label={`${value} / 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < value} size={size} />
      ))}
    </span>
  );
}
