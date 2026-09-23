import type { ReactNode } from "react";

export function Ribbon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 bg-foreground px-7 py-2.5 text-sm font-bold tracking-wide text-background ${className}`}
      style={{
        clipPath:
          "polygon(2.5% 0, 97.5% 0, 100% 50%, 97.5% 100%, 2.5% 100%, 0 50%)",
      }}
    >
      {children}
    </span>
  );
}
