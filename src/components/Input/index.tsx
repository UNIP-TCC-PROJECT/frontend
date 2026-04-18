import type {
  ChangeEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface InputProps {
  label: string;
  name: string;
  value?: string;
  type?: "text" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
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
  onChange,
  inputProps,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="font-medium text-slate-700 text-sm">
        {label}
        {required ? <span className="text-amber-600"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...inputProps}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
          error
            ? "border-amber-300 focus-visible:ring-amber-400/50"
            : "border-slate-200 focus-visible:border-brand-primary"
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
      <label htmlFor={name} className="font-medium text-slate-700 text-sm">
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
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
          error
            ? "border-amber-300 focus-visible:ring-amber-400/50"
            : "border-slate-200 focus-visible:border-brand-primary"
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
