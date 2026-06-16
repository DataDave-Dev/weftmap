type Props = { className?: string };

// Shared brand mark — graph of nodes. Inherits color via currentColor.
export default function Logo({ className = "h-6 w-6" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M20 30 L40 70 L50 50 L60 70 L80 30"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 30 L50 50 L80 30" strokeWidth="2" opacity="0.4" />
      <circle cx="20" cy="30" r="5" fill="currentColor" stroke="none" />
      <circle cx="80" cy="30" r="5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" />
      <circle cx="40" cy="70" r="5" fill="currentColor" stroke="none" />
      <circle cx="60" cy="70" r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}
