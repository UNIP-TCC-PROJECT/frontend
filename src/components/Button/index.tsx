import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "success" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-brand-onPrimary hover:bg-brand-primaryDark focus-visible:ring-brand-primaryText",
  success:
    "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/50",
  ghost:
    "bg-transparent text-brand-primaryText hover:bg-brand-primary/10 focus-visible:ring-brand-primaryText",
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
          <span className="bg-current rounded-full w-2 h-2 animate-pulse" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
