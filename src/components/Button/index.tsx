import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "success" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-blue-700 focus-visible:ring-brand-primary/50",
  success:
    "bg-brand-secondary text-white hover:bg-emerald-600 focus-visible:ring-brand-secondary/50",
  ghost:
    "bg-transparent text-brand-primary hover:bg-blue-50 focus-visible:ring-brand-primary/30",
};

export function Button({
  children,
  isLoading,
  variant = "primary",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 ${
        variantStyles[variant]
      } ${
        isDisabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5"
      } ${className ?? ""}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="bg-white rounded-full w-2 h-2 animate-pulse" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
