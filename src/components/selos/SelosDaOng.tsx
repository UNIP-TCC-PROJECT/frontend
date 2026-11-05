import type { ReactNode } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { fmtDay, levelIcon, levelStyle } from "../../services/transparency";
import type { LevelCode } from "../../services/transparency";
import type {
  CadastroVerificado,
  NivelTransparenciaResumo,
  SelosOng,
} from "../../services/selos";

// Cadastro verificado = verde, sempre independente do nível de transparência (dourado).
const verdeChip = "border-emerald-300 bg-emerald-50 text-emerald-800";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none";

/** Chip compacto de "Cadastro verificado" (cards e cabeçalhos). Só aparece quando a ONG está verificada. */
/** `detalharRessalvas` acrescenta "(com ressalvas)" ao rótulo; nos cards o chip fica enxuto e a informação aparece no perfil. */
export function CadastroVerificadoChip({
  cadastro,
  detalharRessalvas = false,
}: {
  cadastro?: CadastroVerificado;
  detalharRessalvas?: boolean;
}) {
  if (!cadastro?.verificado) return null;
  return (
    <span
      className={`${chip} ${verdeChip}`}
      title={
        cadastro.comRessalvas
          ? "Cadastro verificado com ressalvas (aprovação administrativa)"
          : "Cadastro verificado pela validação institucional da plataforma"
      }
    >
      <FaCheckCircle aria-hidden />
      Cadastro verificado
      {detalharRessalvas && cadastro.comRessalvas ? " (com ressalvas)" : ""}
    </span>
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

/** As duas medalhas lado a lado, quebrando de linha em telas estreitas. */
export default function SelosDaOng({
  selos,
  onAbrirNivel,
}: {
  selos?: SelosOng;
  onAbrirNivel?: () => void;
}) {
  if (!selos) return null;
  const temAlgo =
    selos.cadastroVerificado.verificado || selos.nivelTransparencia;
  if (!temAlgo) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Medalhas da instituição"
    >
      <CadastroVerificadoChip cadastro={selos.cadastroVerificado} />
      <NivelTransparenciaChip
        nivel={selos.nivelTransparencia}
        onClick={onAbrirNivel}
      />
    </div>
  );
}

/** Explicação completa do cadastro verificado (perfil público): o que foi conferido, quando e o que o selo não significa. */
export function CadastroVerificadoPanel({
  cadastro,
  children,
}: {
  cadastro?: CadastroVerificado;
  children?: ReactNode;
}) {
  if (!cadastro?.verificado) return null;
  return (
    <section
      aria-labelledby="cadastro-verificado-titulo"
      className="bg-emerald-50/60 p-5 border border-emerald-200 rounded-2xl"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex justify-center items-center bg-emerald-600 mt-0.5 rounded-full w-10 h-10 text-white text-lg shrink-0"
        >
          <FaCheckCircle />
        </span>
        <div className="min-w-0">
          <h2
            id="cadastro-verificado-titulo"
            className="text-brand-text text-lg"
          >
            Cadastro verificado
          </h2>
          <p className="mt-1 text-brand-muted text-sm">
            A instituição passou pela validação institucional da plataforma
            {cadastro.validadoEm ? (
              <>
                {" "}
                em{" "}
                <strong className="text-brand-text">
                  {fmtDay(cadastro.validadoEm)}
                </strong>
              </>
            ) : null}
            .
            {cadastro.consultadoEm ? (
              <>
                {" "}
                A consulta cadastral mais recente foi em{" "}
                {fmtDay(cadastro.consultadoEm)}.
              </>
            ) : null}
          </p>
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-emerald-800 text-xs uppercase tracking-wider">
        O que foi verificado
      </h3>
      <ul className="space-y-1.5 mt-2 text-brand-text text-sm">
        {cadastro.criterios.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <FaCheckCircle
              aria-hidden
              className="mt-0.5 text-emerald-700 shrink-0"
            />
            {c}
          </li>
        ))}
      </ul>

      {cadastro.comRessalvas && (
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
        O cadastro verificado confirma a validação institucional feita pela
        plataforma. Não é garantia de honestidade, idoneidade ou do uso correto
        dos recursos, e é recalculado automaticamente: se a instituição for
        suspensa ou deixar de atender aos requisitos, o selo deixa de aparecer.
        Ele é independente do nível de transparência.
      </p>
    </section>
  );
}
