import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, imagemUrl } from "../services/api";

interface Publicacao {
  id: number;
  description: string;
  imageUrl: string | null;
  categoryLabel?: string;
  accountability?: { available: boolean };
  ongId: number;
  ong: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  createdAt: string;
}

export default function PublicacaoDetails() {
  const { id } = useParams();
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    api
      .get<Publicacao>(`/publicacoes/${id}`)
      .then(({ data }) => {
        if (ativo) setPublicacao(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível encontrar esta publicação.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <p className="mx-auto max-w-3xl py-8 text-brand-muted">Carregando publicação...</p>;
  }

  if (erro || !publicacao) {
    return (
      <main className="mx-auto max-w-3xl py-8">
        <p role="alert" className="mb-4 text-red-600">
          {erro || "Publicação não encontrada."}
        </p>
        <Link to="/publicacoes" className="text-brand-primary underline">
          Voltar para publicações
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-8">
      <Link
        to="/publicacoes"
        className="mb-5 inline-block text-brand-primary underline"
      >
        ← Voltar para publicações
      </Link>

      <article className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm">
        <Link
          to={`/ongs/${publicacao.ongId}`}
          className="flex items-center gap-3 p-4"
        >
          {publicacao.ong.profileImage ? (
            <img
              src={imagemUrl(publicacao.ong.profileImage) ?? ""}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/15 font-semibold text-brand-text">
              {publicacao.ong.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-brand-text">
            {publicacao.ong.name}
          </span>
        </Link>

        {publicacao.imageUrl && (
          <img
            src={imagemUrl(publicacao.imageUrl) ?? ""}
            alt={`Publicação de ${publicacao.ong.name}`}
            className="max-h-[600px] w-full object-contain"
          />
        )}

        <div className="p-5">
          <p className="whitespace-pre-wrap text-brand-text">
            {publicacao.description}
          </p>
          <time
            dateTime={publicacao.createdAt}
            className="mt-4 block text-sm text-brand-muted"
          >
            {publicacao.categoryLabel ? `${publicacao.categoryLabel} · ` : ""}{new Date(publicacao.createdAt).toLocaleDateString("pt-BR")}
          </time>
          {publicacao.accountability?.available && (
            <Link to={`/publicacoes/${publicacao.id}/prestacao`} className="mt-4 inline-block rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-brand-onPrimary shadow-sm hover:bg-brand-primaryDark">
              Ver prestação de contas desta ação
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}