import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type {
  ChangeEvent,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { applyMask } from "../../utils/mask";

interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: "text" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  /** Pattern where "9" is a digit placeholder, e.g. "(99) 99999-9999". */
  mask?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  name: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
}

interface TextareaProps {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function Input({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required,
  autoComplete,
  error,
  mask,
  onChange,
  inputProps,
}: InputProps) {
  const sharedClassName = `w-full rounded-xl border bg-brand-surface px-4 py-3 text-sm text-brand-text shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30 ${
    error
      ? "border-amber-300 focus-visible:ring-amber-400/50"
      : "border-brand-text/15 focus-visible:border-brand-goldText"
  }`;

  const rawOnChange = inputProps?.onChange ?? onChange;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = mask
    ? (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = applyMask(event.target.value, mask);
        rawOnChange?.(event);
      }
    : rawOnChange;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="font-medium text-brand-muted text-sm">
        {label}
        {required ? <span className="text-amber-600"> *</span> : null}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          {...inputProps}
          onChange={handleChange}
          className={`${sharedClassName}${isPassword ? " pr-12" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="top-1/2 right-3 absolute p-1 text-brand-muted hover:text-brand-text -translate-y-1/2"
          >
            {showPassword ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-amber-600 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  options,
  placeholder,
  required,
  error,
  onChange,
  selectProps,
}: SelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="font-medium text-brand-muted text-sm">
        {label}
        {required ? <span className="text-amber-600"> *</span> : null}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...selectProps}
        className={`w-full rounded-xl border bg-brand-surface px-4 py-3 text-sm text-brand-text shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30 ${
          error
            ? "border-amber-300 focus-visible:ring-amber-400/50"
            : "border-brand-text/15 focus-visible:border-brand-goldText"
        }`}
      >
        <option value="" disabled hidden>
          {placeholder ?? "Selecione"}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-amber-600 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  name,
  value,
  placeholder,
  required,
  error,
  rows = 4,
  onChange,
  textareaProps,
}: TextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="font-medium text-brand-muted text-sm">
        {label}
        {required ? <span className="text-amber-600"> *</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...textareaProps}
        className={`w-full rounded-xl border bg-brand-surface px-4 py-3 text-sm text-brand-text shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30 ${
          error
            ? "border-amber-300 focus-visible:ring-amber-400/50"
            : "border-brand-text/15 focus-visible:border-brand-goldText"
        }`}
      />
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-amber-600 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
