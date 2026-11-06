import { FaHourglassHalf } from "react-icons/fa";
import { fmtDay } from "../../services/transparency";
import type { TransparencyProfile } from "../../services/transparency";
import type { CadastroVerificado } from "../../services/selos";

/** Histórico das etapas de validação (somente eventos públicos já filtrados pelo backend). */
export function HistoricoValidacao({ profile }: { profile: TransparencyProfile }) {
  return (
    <details className="text-xs">
      <summary className="cursor-pointer font-medium">Histórico de validação · informações atualizadas em {fmtDay(profile.lastUpdatedAt)}</summary>
      <ol className="mt-2 space-y-1 border-l-2 border-brand-border pl-3">
        {profile.validationHistory.map((h, i) => <li key={`${h.at}-${i}`}>{fmtDay(h.at)} · {h.label}</li>)}
        {profile.validationHistory.length === 0 && <li>Sem registros.</li>}
      </ol>
    </details>
  );
}

const aviso = "flex gap-3 rounded-2xl border border-brand-border bg-brand-champagne p-4 text-sm text-brand-primaryText";

/**
 * Aviso quando a instituição NÃO tem cadastro verificado. Quando tem, a explicação completa fica no painel
 * "Cadastro verificado" (que é calculado e muda sozinho), então aqui não repetimos a mensagem.
 */
export default function ValidationStatus({ profile, cadastro }: { profile: TransparencyProfile | null; cadastro?: CadastroVerificado }) {
  if (!profile) {
    return (
      <div className={aviso}>
        <FaHourglassHalf className="mt-1 shrink-0 text-brand-goldText" aria-hidden />
        <p><strong>Validação institucional não concluída.</strong> Esta instituição ainda não passou (ou não está mais no) processo de análise da plataforma. Doe com cautela e consulte as informações declaradas.</p>
      </div>
    );
  }
  if (!cadastro || cadastro.verificado) return null; // carregando, ou já explicado no painel do cadastro verificado
  return (
    <div className={`${aviso} flex-col`}>
      <div className="flex gap-3">
        <FaHourglassHalf className="mt-1 shrink-0 text-brand-goldText" aria-hidden />
        <p><strong>Cadastro em revisão.</strong> Algum requisito da validação institucional deixou de ser atendido (por exemplo, um documento voltou para análise), então o selo de cadastro verificado não está sendo exibido no momento. Consulte as informações declaradas com cautela.</p>
      </div>
      <HistoricoValidacao profile={profile} />
    </div>
  );
}
