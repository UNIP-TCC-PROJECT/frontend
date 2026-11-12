import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { api, imagemUrl } from "../services/api";
import { useAuth } from "../context/useAuth";

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
  const navigate = useNavigate();
  const { user } = useAuth();

  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [removendo, setRemovendo] = useState(false);
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

  async function handleRemover() {
    if (!publicacao) return;
    if (!window.confirm("Tem certeza que deseja remover esta publicação?")) {
      return;
    }

    try {
      setRemovendo(true);
      await api.delete(`/publicacoes/${publicacao.id}`);
      navigate("/publicacoes", { replace: true });
    } catch {
      alert("Não foi possível remover a publicação. Tente novamente.");
      setRemovendo(false);
    }
  }

  if (carregando) {
    return (
      <p className="mx-auto max-w-3xl py-8 text-brand-muted">
        Carregando publicação...
      </p>
    );
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

  const podeRemover =
    (user?.type === "ONG" && Number(user.id) === Number(publicacao.ongId)) ||
    user?.type === "ADMIN";

  return (
    <main className="mx-auto max-w-3xl py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/publicacoes"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-brand-onPrimary shadow-sm transition hover:bg-brand-primaryDark"
        >
          <FaArrowLeft aria-hidden /> Voltar para publicações
        </Link>

        {podeRemover && (
          <button
            type="button"
            onClick={handleRemover}
            disabled={removendo}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
          >
            <FaTrash aria-hidden className="h-3 w-3" />
            {removendo ? "Removendo..." : "Remover publicação"}
          </button>
        )}
      </div>

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
            {publicacao.categoryLabel ? `${publicacao.categoryLabel} · ` : ""}
            {new Date(publicacao.createdAt).toLocaleDateString("pt-BR")}
          </time>
          {publicacao.accountability?.available && (
            <Link
              to={`/publicacoes/${publicacao.id}/prestacao`}
              className="mt-4 inline-block rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-brand-onPrimary shadow-sm hover:bg-brand-primaryDark"
            >
              Ver prestação de contas desta ação
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}