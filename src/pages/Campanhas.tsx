import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { api, imagemUrl } from "../services/api";
import { fmtMoney } from "../services/campaigns";
import type { PublicCampaign } from "../services/campaigns";

export default function Campanhas() {
  const [list, setList] = useState<PublicCampaign[] | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    api.get<PublicCampaign[]>("/campaigns").then((r) => setList(r.data)).catch(() => setErro("Não foi possível carregar as campanhas."));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-brand-text">Campanhas</h1>
      <p className="text-sm text-brand-muted">Somente instituições validadas pela nossa equipe publicam campanhas.</p>
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {list && !list.length && <p className="text-brand-muted">Nenhuma campanha ativa no momento.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((c) => (
          <Link key={c.id} to={`/campanhas/${c.id}`} className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition hover:shadow-md">
            {c.imageUrl ? <img src={imagemUrl(c.imageUrl)!} alt="" className="h-40 w-full object-cover" /> : <div className="h-40 bg-brand-champagne" />}
            <div className="space-y-2 p-4">
              <h2 className="font-semibold text-brand-text">{c.title}</h2>
              <p className="text-xs text-brand-muted">{c.organizationName}</p>
              <ProgressBar value={c.raisedCents} goal={c.goalCents} />
              <p className="text-sm text-brand-text">{fmtMoney(c.raisedCents)} <span className="text-brand-muted">de {fmtMoney(c.goalCents)}</span></p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
