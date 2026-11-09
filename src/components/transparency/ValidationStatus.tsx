import { FaHourglassHalf } from "react-icons/fa";
import { fmtDay } from "../../services/transparency";
import type { TransparencyProfile } from "../../services/transparency";
import type { MedalhaBranca } from "../../services/selos";

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
 * Aviso quando a instituição NÃO tem Medalha Branca. Quando tem, a explicação fica no painel da medalha.
 */
export default function ValidationStatus({ profile, medalha }: { profile: TransparencyProfile | null; medalha?: MedalhaBranca }) {
  if (!profile) {
    return (
      <div className={aviso}>
        <FaHourglassHalf className="mt-1 shrink-0 text-brand-goldText" aria-hidden />
        <p><strong>Validação institucional não concluída.</strong> Esta instituição ainda não passou (ou não está mais no) processo de análise da plataforma. Doe com cautela e consulte as informações declaradas.</p>
      </div>
    );
  }
  if (!medalha || medalha.verificado) return null; // carregando, ou já explicado no painel da Medalha Branca
  return (
    <div className={`${aviso} flex-col`}>
      <div className="flex gap-3">
        <FaHourglassHalf className="mt-1 shrink-0 text-brand-goldText" aria-hidden />
        <p><strong>Validação institucional em revisão.</strong> Algum requisito deixou de ser atendido (por exemplo, um documento voltou para análise), então a Medalha Branca não está sendo exibida no momento. Consulte as informações declaradas com cautela.</p>
      </div>
      <HistoricoValidacao profile={profile} />
    </div>
  );
}
