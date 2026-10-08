import { BRAND } from "../constants/brand";

interface BrandLogoProps {
  variant?: "light" | "dark";
  compactOnMobile?: boolean;
}

export function BrandLogo({
  variant = "light",
  compactOnMobile = false,
}: BrandLogoProps) {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <img
        src={BRAND.symbol}
        alt={compactOnMobile ? BRAND.name : ""}
        className={`shrink-0 rounded-full ${
          compactOnMobile ? "h-9 w-9 sm:h-12 sm:w-12" : "h-10 w-10"
        }`}
      />
      <div className={compactOnMobile ? "hidden sm:block" : "block"}>
        <span
          className={`block font-brand text-2xl font-normal leading-none tracking-tight ${
            variant === "dark" ? "text-brand-background" : "text-brand-text"
          }`}
        >
          {BRAND.name}
        </span>
        <span
          className={`mt-1 block font-sans text-[10px] font-bold leading-tight tracking-wide ${
            variant === "dark" ? "text-brand-goldLight" : "text-brand-goldText"
          }`}
        >
          {BRAND.slogan}
        </span>
      </div>
    </div>
  );
}
