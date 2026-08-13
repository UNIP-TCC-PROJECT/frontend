import { useState } from "react";

interface Meta {
  id: number;
  title: string;
  description?: string;
  type: "FINANCEIRA" | "MATERIAL" | "VOLUNTARIADO";
  targetAmount?: number | string;
  currentAmount: number | string;
  targetQuantity?: number;
  currentQuantity: number;
  unit?: string;
  deadline?: string;
  active: boolean;
  ongId: number;
}

interface MetaCarouselProps {
  metas: Meta[];
  onSelectMeta: (meta: Meta) => void;
}

export default function MetaCarousel({
  metas,
  onSelectMeta,
}: MetaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  function getProgress(meta: Meta) {
    if (meta.type === "FINANCEIRA") {
      const target = Number(meta.targetAmount ?? 0);
      const current = Number(meta.currentAmount ?? 0);

      if (target <= 0) return 0;

      return Math.min((current / target) * 100, 100);
    }

    const target = Number(meta.targetQuantity ?? 0);
    const current = Number(meta.currentQuantity ?? 0);

    if (target <= 0) return 0;

    return Math.min((current / target) * 100, 100);
  }

  function formatCurrency(value: number | string) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getTypeLabel(type: Meta["type"]) {
    if (type === "FINANCEIRA") return "Financeira";
    if (type === "MATERIAL") return "Material";
    return "Voluntariado";
  }

  function getTypeIcon(type: Meta["type"]) {
    if (type === "FINANCEIRA") return "💰";
    if (type === "MATERIAL") return "📦";
    return "🤝";
  }

  if (metas.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          Esta ONG não possui metas ou campanhas ativas no momento.
        </p>
      </div>
    );
  }

  const meta = metas[currentIndex];
  const progress = getProgress(meta);

  function nextMeta() {
    setCurrentIndex((prev) =>
      prev === metas.length - 1 ? 0 : prev + 1
    );
  }

  function previousMeta() {
    setCurrentIndex((prev) =>
      prev === 0 ? metas.length - 1 : prev - 1
    );
  }

  return (
    <div>
      {/* Card da meta */}
      <button
  type="button"
  onClick={() => onSelectMeta(meta)}
  className="w-full rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>

        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">

          <span className="text-3xl">
            {getTypeIcon(meta.type)}
          </span>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {getTypeLabel(meta.type)}
          </span>

        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-900">
          {meta.title}
        </h3>

        {/* Descrição */}
        {meta.description && (
          <p className="mt-3 leading-relaxed text-gray-600">
            {meta.description}
          </p>
        )}

        {/* Progresso */}
        <div className="mt-6">

          {meta.type === "FINANCEIRA" ? (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">
                {formatCurrency(meta.currentAmount)}
              </span>

              <span className="text-gray-500">
                de {formatCurrency(meta.targetAmount ?? 0)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">
                {meta.currentQuantity} {meta.unit ?? "unidades"}
              </span>

              <span className="text-gray-500">
                de {meta.targetQuantity ?? 0}{" "}
                {meta.unit ?? "unidades"}
              </span>
            </div>
          )}

          {/* Barra */}
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-700 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* Porcentagem + prazo */}
          <div className="mt-2 flex justify-between text-xs">

            <span className="font-semibold text-blue-700">
              {Math.round(progress)}% alcançado
            </span>

            {meta.deadline && (
              <span className="text-gray-500">
                Até{" "}
                {new Date(meta.deadline).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
    </button>
      {/* Navegação */}
      {metas.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">

          <button
            onClick={previousMeta}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
            aria-label="Meta anterior"
          >
            ←
          </button>

          {/* Indicadores */}
          <div className="flex items-center gap-2">
            {metas.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === currentIndex
                    ? "w-6 bg-blue-700"
                    : "bg-gray-300"
                }`}
                aria-label={`Ir para a meta ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextMeta}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
            aria-label="Próxima meta"
          >
            →
          </button>

        </div>
      )}

      {/* Contador */}
      {metas.length > 1 && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Meta {currentIndex + 1} de {metas.length}
        </p>
      )}
    </div>
  );
}