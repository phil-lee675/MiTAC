import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "bg-brand-700 text-white hover:bg-brand-500"
      : "border border-slate-200 text-slate-700 hover:border-slate-300";
  return (
    <button
      className={`rounded px-3 py-2 text-sm ${base} ${className}`}
      {...props}
    />
  );
}
