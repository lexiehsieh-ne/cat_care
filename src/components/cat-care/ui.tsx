import type { ComponentProps, ReactNode } from "react";

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-w-0 rounded-xl border border-line bg-background px-3 py-2 text-base text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold-soft";

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-foreground font-bold text-background hover:opacity-90 disabled:opacity-40",
    ghost: "text-foreground/70 hover:bg-blush-soft/60",
    danger: "text-red-600 hover:bg-red-50",
  }[variant];
  return (
    <button
      type="button"
      className={`min-h-11 rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed sm:min-h-9 sm:pointer-coarse:min-h-11 ${styles} ${className}`}
      {...props}
    />
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
