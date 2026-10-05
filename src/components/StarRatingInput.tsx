import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (nota: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div
      role="group"
      aria-label="Selecione uma nota de 1 a 5 estrelas"
      className="flex gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((estrela) => (
        <button
          key={estrela}
          type="button"
          disabled={disabled}
          aria-label={`${estrela} ${estrela === 1 ? "estrela" : "estrelas"}`}
          aria-pressed={value === estrela}
          onClick={() => onChange(estrela)}
          onMouseEnter={() => { 
            if (!disabled) setHover(estrela);
          }}
          className={`rounded text-3xl transition
            focus-visible:outline focus-visible:outline-2
            focus-visible:outline-blue-700
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              estrela <= ((!disabled && hover) || value)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}