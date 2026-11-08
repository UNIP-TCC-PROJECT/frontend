import { FaBoxOpen, FaCoins, FaHandsHelping } from "react-icons/fa";

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
    if (meta.type === "FINANCEIRA") return <FaCoins aria-hidden="true" />;
    if (meta.type === "MATERIAL") return <FaBoxOpen aria-hidden="true" />;
    return <FaHandsHelping aria-hidden="true" />;
  }

  const progress = getProgress();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-brand-surface p-8 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Cabeçalho */}
        <div className="mb-6 flex items-start justify-between">

          <div className="flex items-center gap-3">

            <span className="text-3xl text-brand-gold">
              {getTypeIcon()}
            </span>

            <span className="rounded-full bg-brand-champagne px-3 py-1 text-xs font-semibold text-brand-goldText">
              {getTypeLabel()}
            </span>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-brand-text/40 transition hover:text-brand-text"
            aria-label="Fechar"
          >
            ×
          </button>

        </div>

        {/* Título */}
        <h2 className="text-3xl font-sans text-brand-text">
          {meta.title}
        </h2>

        {/* Descrição */}
        {meta.description && (
          <p className="mt-4 leading-relaxed text-brand-muted">
            {meta.description}
          </p>
        )}

        {/* Progresso */}
        <div className="mt-8">

          <div className="flex items-center justify-between">

            {meta.type === "FINANCEIRA" ? (
              <>
                <span className="text-xl font-bold text-brand-text">
                  {formatCurrency(meta.currentAmount)}
                </span>

                <span className="text-brand-muted">
                  de {formatCurrency(meta.targetAmount ?? 0)}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-brand-text">
                  {meta.currentQuantity} {meta.unit ?? "unidades"}
                </span>

                <span className="text-brand-muted">
                  de {meta.targetQuantity ?? 0}{" "}
                  {meta.unit ?? "unidades"}
                </span>
              </>
            )}

          </div>

          {/* Barra */}
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-brand-champagne">

            <div
              className="h-full rounded-full bg-brand-gold transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <p className="mt-2 text-sm font-semibold text-brand-primaryText">
            {Math.round(progress)}% alcançado
          </p>

        </div>

        {/* Prazo */}
        {meta.deadline && (
          <div className="mt-6 rounded-xl bg-brand-champagne p-4">

            <p className="text-sm text-brand-muted">
              Prazo para atingir a meta
            </p>

            <p className="mt-1 font-semibold text-brand-text">
              {new Date(meta.deadline).toLocaleDateString("pt-BR")}
            </p>

          </div>
        )}

        {/* Futuro botão de ajuda */}
        <div className="mt-8 border-t border-brand-border pt-6">

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-brand-text/15 px-5 py-3 font-semibold text-brand-muted"
          >
            Quero ajudar
          </button>

          <p className="mt-2 text-center text-xs text-brand-muted">
            Em breve você poderá contribuir com esta meta.
          </p>

        </div>

      </div>
    </div>
  );
}
