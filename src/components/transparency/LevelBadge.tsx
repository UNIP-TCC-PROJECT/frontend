import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaRegCircle,
  FaMinusCircle,
  FaTimes,
} from "react-icons/fa";
import {
  LEVEL_ORDER,
  dimensionLabel,
  fmtDateTime,
  levelIcon,
  levelNames,
  levelRequirement,
  levelStyle,
} from "../../services/transparency";
import type {
  DimensionStatus,
  TransparencyLevel,
} from "../../services/transparency";

const statusIcon: Record<DimensionStatus, typeof FaCheckCircle> = {
  ATENDIDA: FaCheckCircle,
  PENDENTE: FaRegCircle,
  NAO_SE_APLICA: FaMinusCircle,
};
const statusColor: Record<DimensionStatus, string> = {
  ATENDIDA: "text-emerald-700",
  PENDENTE: "text-brand-goldText",
  NAO_SE_APLICA: "text-brand-muted",
};

export function LevelModal({
  level,
  onClose,
}: {
  level: TransparencyLevel;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const code = level.level ?? "NONE";
  const Icon = levelIcon[code];

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nivel-titulo"
        className="bg-brand-surface shadow-xl p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-xl ${levelStyle[code]}`}
            >
              <Icon aria-hidden />
            </span>
            <h2 id="nivel-titulo" className="text-brand-text text-xl">
              {level.levelLabel}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="hover:bg-brand-champagne p-2 rounded-full text-brand-muted"
          >
            <FaTimes />
          </button>
        </div>

        <p className="mt-3 text-brand-muted text-sm leading-relaxed">
          {level.levelMeaning}
        </p>

        <h3 className="mt-5 font-semibold text-brand-goldText text-sm uppercase tracking-wider">
          O que é avaliado
        </h3>
        <ul className="space-y-3 mt-2">
          {level.dimensions.map((d) => {
            const S = statusIcon[d.status];
            return (
              <li
                key={d.key}
                className="bg-brand-background p-3 border border-brand-border rounded-xl"
              >
                <div className="flex justify-between items-center gap-2">
                  <strong className="text-brand-text text-sm">{d.label}</strong>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${statusColor[d.status]}`}
                  >
                    <S aria-hidden />
                    {dimensionLabel[d.status]}
                  </span>
                </div>
                <p className="mt-1 text-brand-muted text-xs">{d.question}</p>
                {d.met.length > 0 && (
                  <ul className="mt-2 pl-5 text-brand-text text-xs list-disc">
                    {d.met.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
                {d.pending.length > 0 && (
                  <ul className="mt-1 pl-5 text-brand-goldText text-xs list-disc">
                    {d.pending.map((m) => (
                      <li key={m}>Pendente: {m}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {level.nextStep && (
          <p className="bg-brand-champagne mt-4 p-3 rounded-xl text-brand-primaryText text-sm">
            <strong>Próximo passo:</strong> {level.nextStep}
          </p>
        )}

        <h3 className="mt-5 font-semibold text-brand-goldText text-sm uppercase tracking-wider">
          Os quatro níveis
        </h3>
        <ol className="space-y-1 mt-2 text-brand-muted text-xs">
          {LEVEL_ORDER.map((c) => (
            <li key={c}>
              <strong className={level.level === c ? "text-brand-text" : ""}>
                {levelNames[c]}:
              </strong>{" "}
              {levelRequirement[c]}
            </li>
          ))}
        </ol>

        <p className="mt-5 pt-3 border-brand-border border-t text-brand-muted text-xs">
          Avaliado em {fmtDateTime(level.evaluatedAt)} (regras versão{" "}
          {level.rulesVersion}). O nível é calculado automaticamente a partir
          dos registros da plataforma; a instituição não o escolhe. Não é nota
          de confiança, não mede a segurança técnica do sistema e não garante
          regularidade permanente. Não há penalidade por a instituição ser
          pequena: o que ainda não se aplica não conta contra.
        </p>
      </div>
    </div>
  );
}

/** Medalha clicável do nível atual. */
export default function LevelBadge({
  level,
  compact = false,
}: {
  level: TransparencyLevel;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const code = level.level ?? "NONE";
  const Icon = levelIcon[code];
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${levelStyle[code]}`}
      >
        <Icon aria-hidden />
        <span>{level.levelLabel}</span>
        {!compact && (
          <span className="font-normal text-xs underline">ver critérios</span>
        )}
      </button>
      {open && <LevelModal level={level} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Os quatro níveis em sequência, destacando o atual (cada medalha abre o mesmo detalhamento). */
export function LevelLadder({ level }: { level: TransparencyLevel }) {
  const [open, setOpen] = useState(false);
  const idx = level.level ? LEVEL_ORDER.indexOf(level.level) : -1;
  return (
    <>
      <ol
        className="gap-3 grid grid-cols-2 sm:grid-cols-4"
        aria-label="Níveis de transparência"
      >
        {LEVEL_ORDER.map((c, i) => {
          const Icon = levelIcon[c];
          const reached = i <= idx;
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-current={i === idx ? "step" : undefined}
                className={`flex h-full w-full flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs transition hover:-translate-y-0.5 ${reached ? levelStyle[c] : `${levelStyle.NONE} border-dashed`} ${i === idx ? "ring-2 ring-brand-goldText" : ""}`}
              >
                <Icon className="text-2xl" aria-hidden />
                <span className="font-semibold">{levelNames[c]}</span>
                {i === idx && (
                  <span className="bg-brand-surface/70 px-2 py-0.5 rounded-full font-semibold text-[10px] text-brand-primaryText">
                    Nível atual
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      {idx < 0 && (
        <p className="mt-3 text-brand-muted text-sm">
          Avaliação em andamento: ainda não há dados suficientes para atribuir
          um nível. Isso não indica irregularidade.
        </p>
      )}
      {open && <LevelModal level={level} onClose={() => setOpen(false)} />}
    </>
  );
}
