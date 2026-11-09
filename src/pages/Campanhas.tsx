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
    api
      .get<PublicCampaign[]>("/campaigns")
      .then((r) => setList(r.data))
      .catch(() => setErro("Não foi possível carregar as campanhas."));
  }, []);

  return (
    <div className="space-y-6 py-8">
      <h1 className="font-semibold text-brand-text text-2xl">Campanhas</h1>
      <p className="text-brand-muted text-sm">
        As campanhas exibidas foram aprovadas pela plataforma e estão ativas
        dentro do período informado. ONGs com CNPJ conferido podem enviá-las
        para análise; com a Medalha Branca, a aprovação ocorre sem análise prévia.
      </p>
      {erro && (
        <p role="alert" className="text-red-700">
          {erro}
        </p>
      )}
      {list && !list.length && (
        <p className="text-brand-muted">Nenhuma campanha ativa no momento.</p>
      )}
      <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((c) => (
          <Link
            key={c.id}
            to={`/campanhas/${c.id}`}
            className="bg-brand-surface hover:shadow-md border border-brand-border rounded-2xl overflow-hidden transition"
          >
            {c.imageUrl ? (
              <img
                src={imagemUrl(c.imageUrl)!}
                alt=""
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="bg-brand-champagne h-40" />
            )}
            <div className="space-y-2 p-4">
              <h2 className="font-semibold text-brand-text">{c.title}</h2>
              <p className="text-brand-muted text-xs">{c.organizationName}</p>
              <ProgressBar value={c.raisedCents} goal={c.goalCents} />
              <p className="text-brand-text text-sm">
                {fmtMoney(c.raisedCents)}{" "}
                <span className="text-brand-muted">
                  de {fmtMoney(c.goalCents)}
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
