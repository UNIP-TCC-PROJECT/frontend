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

interface MetaDetailsModalProps {
  meta: Meta;
  onClose: () => void;
}

export default function MetaDetailsModal({
  meta,
  onClose,
}: MetaDetailsModalProps) {

  function getProgress() {
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

  function getTypeLabel() {
    if (meta.type === "FINANCEIRA") return "Financeira";
    if (meta.type === "MATERIAL") return "Material";
    return "Voluntariado";
  }

  function getTypeIcon() {
    if (meta.type === "FINANCEIRA") return "💰";
    if (meta.type === "MATERIAL") return "📦";
    return "🤝";
  }

  const progress = getProgress();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Cabeçalho */}
        <div className="mb-6 flex items-start justify-between">

          <div className="flex items-center gap-3">

            <span className="text-3xl">
              {getTypeIcon()}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {getTypeLabel()}
            </span>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 transition hover:text-gray-700"
            aria-label="Fechar"
          >
            ×
          </button>

        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900">
          {meta.title}
        </h2>

        {/* Descrição */}
        {meta.description && (
          <p className="mt-4 leading-relaxed text-gray-600">
            {meta.description}
          </p>
        )}

        {/* Progresso */}
        <div className="mt-8">

          <div className="flex items-center justify-between">

            {meta.type === "FINANCEIRA" ? (
              <>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(meta.currentAmount)}
                </span>

                <span className="text-gray-500">
                  de {formatCurrency(meta.targetAmount ?? 0)}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-900">
                  {meta.currentQuantity} {meta.unit ?? "unidades"}
                </span>

                <span className="text-gray-500">
                  de {meta.targetQuantity ?? 0}{" "}
                  {meta.unit ?? "unidades"}
                </span>
              </>
            )}

          </div>

          {/* Barra */}
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-full rounded-full bg-blue-700 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <p className="mt-2 text-sm font-semibold text-blue-700">
            {Math.round(progress)}% alcançado
          </p>

        </div>

        {/* Prazo */}
        {meta.deadline && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">

            <p className="text-sm text-gray-500">
              Prazo para atingir a meta
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {new Date(meta.deadline).toLocaleDateString("pt-BR")}
            </p>

          </div>
        )}

        {/* Futuro botão de ajuda */}
        <div className="mt-8 border-t border-gray-100 pt-6">

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-5 py-3 font-semibold text-gray-500"
          >
            Quero ajudar
          </button>

          <p className="mt-2 text-center text-xs text-gray-400">
            Em breve você poderá contribuir com esta meta.
          </p>

        </div>

      </div>
    </div>
  );
}