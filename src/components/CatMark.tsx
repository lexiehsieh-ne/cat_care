export function CatMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 10 L6 4 L12 8.5" />
      <path d="M24 10 L26 4 L20 8.5" />
      <circle cx="16" cy="17.5" r="10" />
      <circle cx="12.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <path d="M16 19.5 v1" />
      <path d="M13 22 q3 2 6 0" />
    </svg>
  );
}
