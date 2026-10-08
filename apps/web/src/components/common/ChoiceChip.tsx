import type { InputHTMLAttributes } from "react";

interface ChoiceChipProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  inputType?: "radio" | "checkbox";
}

export default function ChoiceChip({ label, inputType = "checkbox", className = "", ...inputProps }: ChoiceChipProps) {
  const selected = Boolean(inputProps.checked);
  return (
    <label className={`inline-flex min-h-8 cursor-pointer items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      <input type={inputType} className="sr-only" {...inputProps} />
      {label}
    </label>
  );
}
