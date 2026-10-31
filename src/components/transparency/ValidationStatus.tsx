import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { fmtDay } from "../../services/transparency";
import type { TransparencyProfile } from "../../services/transparency";

/** Status da validação institucional com explicação simples (sem prometer honestidade nem regularidade permanente). */
export default function ValidationStatus({ profile }: { profile: TransparencyProfile | null }) {
  if (!profile) {
    return (
      <div className="flex gap-3 rounded-2xl border border-brand-border bg-brand-champagne p-4 text-sm text-brand-primaryText">
        <FaHourglassHalf className="mt-1 shrink-0 text-brand-goldText" aria-hidden />
        <p><strong>Validação institucional não concluída.</strong> Esta instituição ainda não passou (ou não está mais no) processo de análise da plataforma. Doe com cautela e consulte as informações declaradas.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-700/30 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div className="flex gap-3">
        <FaCheckCircle className="mt-1 shrink-0" aria-hidden />
        <div>
          <p><strong>Instituição validada:</strong> os dados cadastrais e a documentação passaram pelo processo de análise da plataforma{profile.validation.validatedAt ? ` em ${fmtDay(profile.validation.validatedAt)}` : ""}.</p>
          <p className="mt-1 text-xs text-emerald-900/80">A validação indica que a instituição passou pelas etapas de análise. Não garante honestidade, resultados nem regularidade permanente.</p>
        </div>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer font-medium">Histórico de validação · informações atualizadas em {fmtDay(profile.lastUpdatedAt)}</summary>
        <ol className="mt-2 space-y-1 border-l-2 border-emerald-700/30 pl-3">
          {profile.validationHistory.map((h, i) => <li key={`${h.at}-${i}`}>{fmtDay(h.at)} · {h.label}</li>)}
          {profile.validationHistory.length === 0 && <li>Sem registros.</li>}
        </ol>
      </details>
    </div>
  );
}
