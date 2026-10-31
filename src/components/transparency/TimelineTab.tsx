import { Link } from "react-router-dom";
import { fmtDay } from "../../services/transparency";
import type { TimelineItem } from "../../services/transparency";

function refLink(ref: TimelineItem["ref"]) {
  if (!ref) return null;
  if (ref.type === "publication") return { to: `/publicacoes/${ref.id}`, label: "Ver publicação" };
  if (ref.type === "campaign") return { to: `/campanhas/${ref.id}`, label: "Ver campanha" };
  return null;
}

/** Linha do tempo pública: somente registros reais (cadastro, validação, campanhas, publicações, despesas aprovadas, entregas). */
export default function TimelineTab({ timeline }: { timeline: TimelineItem[] }) {
  if (timeline.length === 0) return <p className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-brand-muted">Ainda não há eventos registrados.</p>;
  return (
    <ol className="space-y-5 border-l-2 border-brand-border pl-5">
      {timeline.map((ev, i) => {
        const l = refLink(ev.ref);
        return (
          <li key={i} className="relative">
            <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-brand-surface bg-brand-goldLight" aria-hidden />
            <time className="text-xs text-brand-muted">{fmtDay(ev.at)}{ev.campaignTitle ? ` · ${ev.campaignTitle}` : ""}</time>
            <div className="text-sm font-semibold text-brand-text">{ev.title}</div>
            {ev.detail && <p className="text-sm text-brand-muted">{ev.detail}</p>}
            {l && <Link to={l.to} className="text-xs font-medium text-brand-goldText underline">{l.label}</Link>}
          </li>
        );
      })}
    </ol>
  );
}
