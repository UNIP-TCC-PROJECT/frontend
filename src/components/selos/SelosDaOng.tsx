import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { fmtDay, levelIcon, levelStyle } from "../../services/transparency";
import type { LevelCode } from "../../services/transparency";
import type {
  MedalhaBranca,
  NivelTransparenciaResumo,
  SelosOng,
} from "../../services/selos";

// Medalha Branca = validação institucional; o nível de transparência é independente.
const medalhaBrancaChip = "border-slate-300 bg-white text-slate-800";
const cnpjChip = "border-sky-300 bg-sky-50 text-sky-800";

/** Tamanho único dos chips de medalha (verde e níveis), para ficarem sempre na mesma altura. */
export const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none";

/** Chip compacto da Medalha Branca. */
export function MedalhaBrancaChip({
  medalha,
  detalharRessalvas = false,
}: {
  medalha?: MedalhaBranca;
  detalharRessalvas?: boolean;
}) {
  if (!medalha?.verificado) return null;
  return (
    <span
      className={`${chip} ${medalhaBrancaChip}`}
      title={
        medalha.comRessalvas
          ? "Medalha Branca concedida com ressalvas após validação institucional"
          : "Medalha Branca concedida após validação institucional"
      }
    >
      <FaCheckCircle aria-hidden />
      Medalha Branca
      {detalharRessalvas && medalha.comRessalvas ? " (com ressalvas)" : ""}
    </span>
  );
}

/** Indica a conferência automática dos dados públicos do CNPJ no cadastro. */
export function VerificacaoCnpjChip({ verificado }: { verificado?: boolean }) {
  const [tooltipVisivel, setTooltipVisivel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  function cancelarTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function iniciarTimer() {
    cancelarTimer();
    timer.current = setTimeout(() => setTooltipVisivel(true), 800);
  }

  useEffect(() => cancelarTimer, []);

  if (!verificado) return null;
  return (
    <div
      className={`${chip} ${cnpjChip} relative cursor-help`}
      tabIndex={0}
      aria-describedby={tooltipVisivel ? tooltipId : undefined}
      onMouseEnter={iniciarTimer}
      onMouseLeave={() => {
        cancelarTimer();
        setTooltipVisivel(false);
      }}
      onFocus={() => {
        cancelarTimer();
        setTooltipVisivel(true);
      }}
      onBlur={() => setTooltipVisivel(false)}
    >
      <FaCheckCircle aria-hidden />
      CNPJ conferido
      {tooltipVisivel && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-sky-200 bg-white p-3 text-left text-xs font-medium leading-relaxed text-brand-text shadow-lg"
        >
          <p className="mb-2 font-semibold">Critérios conferidos</p>
          <ul className="space-y-1.5">
            {[
              "CNPJ ativo",
              "Nome oficial",
              "Natureza jurídica",
              "Atividade econômica",
            ].map((criterio) => (
              <li key={criterio} className="flex items-start gap-2">
                <FaCheck
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                {criterio}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Chip compacto do nível de transparência; a cor e o ícone mudam conforme o nível. */
export function NivelTransparenciaChip({
  nivel,
  onClick,
}: {
  nivel?: NivelTransparenciaResumo | null;
  onClick?: () => void;
}) {
  if (!nivel) return null;
  const code: LevelCode | "NONE" = nivel.nivel ?? "NONE";
  const Icon = levelIcon[code];
  const className = `${chip} ${levelStyle[code]}`;
  const content = (
    <>
      <Icon aria-hidden />
      {nivel.rotulo}
    </>
  );
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${className} transition hover:-translate-y-0.5 hover:shadow-sm`}
      title="Ver os critérios do nível de transparência"
    >
      {content}
    </button>
  ) : (
    <span
      className={className}
      title={`${nivel.rotulo}: calculado automaticamente a partir dos registros da plataforma`}
    >
      {content}
    </span>
  );
}

/** Indicadores e nível de transparência lado a lado, quebrando em telas estreitas. */
export default function SelosDaOng({
  selos,
  onAbrirNivel,
}: {
  selos?: SelosOng;
  onAbrirNivel?: () => void;
}) {
  if (!selos) return null;
  const temAlgo =
    selos.verificacaoCnpj.verificado ||
    selos.medalhaBranca.verificado ||
    selos.nivelTransparencia;
  if (!temAlgo) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Verificações e transparência da instituição"
    >
      <MedalhaBrancaChip medalha={selos.medalhaBranca} />
      <VerificacaoCnpjChip verificado={selos.verificacaoCnpj.verificado} />
      <NivelTransparenciaChip
        nivel={selos.nivelTransparencia}
        onClick={onAbrirNivel}
      />
    </div>
  );
}

/** Explicação da Medalha Branca no perfil público. */
export function MedalhaBrancaPanel({
  medalha,
  children,
}: {
  medalha?: MedalhaBranca;
  children?: ReactNode;
}) {
  if (!medalha?.verificado) return null;
  return (
    <section
      aria-labelledby="medalha-branca-titulo"
      className="bg-slate-50 p-5 border border-slate-200 rounded-2xl"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex justify-center items-center bg-white mt-0.5 rounded-full w-10 h-10 text-slate-700 text-lg shrink-0 border border-slate-300"
        >
          <FaCheckCircle />
        </span>
        <div className="min-w-0">
          <h2
            id="medalha-branca-titulo"
            className="text-brand-text text-lg"
          >
            Medalha Branca
          </h2>
          <p className="mt-1 text-brand-muted text-sm">
            A instituição passou pela validação institucional da plataforma
            {medalha.validadoEm ? (
              <>
                {" "}
                em{" "}
                <strong className="text-brand-text">
                  {fmtDay(medalha.validadoEm)}
                </strong>
              </>
            ) : null}
            .
            {medalha.consultadoEm ? (
              <>
                {" "}
                A consulta cadastral mais recente foi em{" "}
                {fmtDay(medalha.consultadoEm)}.
              </>
            ) : null}
          </p>
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-slate-700 text-xs uppercase tracking-wider">
        O que foi verificado
      </h3>
      <ul className="space-y-1.5 mt-2 text-brand-text text-sm">
        {medalha.criterios.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <FaCheckCircle
              aria-hidden
              className="mt-0.5 text-slate-600 shrink-0"
            />
            {c}
          </li>
        ))}
      </ul>

      {medalha.comRessalvas && (
        <p
          role="note"
          className="bg-brand-champagne mt-4 p-3 border border-brand-gold rounded-xl text-brand-primaryText text-sm"
        >
          <strong>Aprovação administrativa com ressalvas.</strong> Algumas
          conferências automáticas apontaram divergências ou ficaram
          indisponíveis, e a administração da plataforma aprovou o cadastro após
          análise manual, com justificativa registrada internamente.
        </p>
      )}

      {children && <div className="mt-4 text-brand-text">{children}</div>}

      <p className="mt-4 pt-3 border-emerald-200 border-t text-brand-muted text-xs">
        A Medalha Branca confirma a validação institucional feita pela
        plataforma. Não é garantia de honestidade, idoneidade ou do uso correto
        dos recursos, e é recalculado automaticamente: se a instituição for
        suspensa ou deixar de atender aos requisitos, a medalha deixa de aparecer.
        Ele é independente do nível de transparência.
      </p>
    </section>
  );
}
