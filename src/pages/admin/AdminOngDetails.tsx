import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { errorMessage } from "../../services/organizations";
import HistoricoMedalhaBranca from "../../components/HistoricoMedalhaBranca";

interface Ong {
  id: number;
  name: string;
  email: string;
  cnpj?: string;
  phone?: string;
  description?: string;
  category?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  status: "ATIVO" | "SUSPENSO" | "BANIDO";
  contentRestricted: boolean;
}

const actions = {
  RESTRINGIR: {
    label: "Restringir",
    effect: "A ONG mantém acesso à conta, mas fica impedida de enviar ou alterar campanhas, metas e publicações.",
  },
  REMOVER_RESTRICAO: {
    label: "Remover restrição",
    effect: "A ONG volta a poder enviar e alterar conteúdo conforme suas permissões.",
  },
  SUSPENDER: {
    label: "Suspender",
    effect: "A conta perde o acesso e as sessões são encerradas. A suspensão fica em vigor até a reativação.",
  },
  BANIR: {
    label: "Banir",
    effect: "A conta será marcada como banida, perderá o acesso e terá as sessões encerradas. A reativação exige uma nova ação administrativa.",
  },
  REATIVAR: {
    label: "Reativar conta",
    effect: "A ONG volta a poder entrar na conta. Se havia restrição de conteúdo, ela continua em vigor.",
  },
};
type Action = keyof typeof actions;
type ModerationState = Pick<Ong, "status" | "contentRestricted">;

function OngModeration({ ong }: { ong: Ong }) {
  const [current, setCurrent] = useState<ModerationState>(ong);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const available: Action[] = current.status === "ATIVO"
    ? [current.contentRestricted ? "REMOVER_RESTRICAO" : "RESTRINGIR", "SUSPENDER", "BANIR"]
    : current.status === "SUSPENSO" ? ["REATIVAR", "BANIR"] : ["REATIVAR"];
  const statusLabel = current.status === "ATIVO"
    ? (current.contentRestricted ? "Ativa com restrição de conteúdo" : "Ativa")
    : current.status === "SUSPENSO" ? "Suspensa" : "Banida";

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !action || !reason.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch<ModerationState>(`/admin/ongs/${ong.id}/moderacao`, {
        action,
        reason: reason.trim(),
      });
      setCurrent(data);
      setAction(null);
      setReason("");
      setSuccess("Situação da conta atualizada.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white mt-6 p-6 border border-gray-200 rounded-xl">
      <h2 className="mb-3 font-semibold text-gray-900">Ações administrativas</h2>
      <p className="mb-4 text-sm text-gray-700">
        Situação da conta: <strong>{statusLabel}</strong>
      </p>
      <div className="flex flex-wrap gap-3">
        {available.map((item) => (
          <button
            key={item}
            type="button"
            disabled={busy}
            aria-pressed={action === item}
            onClick={() => { setAction(item); setReason(""); setError(""); setSuccess(""); }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 aria-pressed:bg-gray-100 disabled:opacity-50"
          >
            {actions[item].label}
          </button>
        ))}
      </div>
      {action && (
        <form className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4" onSubmit={(event) => void confirm(event)}>
          <p className="text-sm text-slate-700">{actions[action].effect}</p>
          <label className="block text-sm text-slate-700">
            Justificativa para {actions[action].label.toLowerCase()}
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={1000}
              required
              disabled={busy}
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !reason.trim()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50">
              {busy ? "Salvando…" : "Confirmar ação"}
            </button>
            <button type="button" disabled={busy} onClick={() => setAction(null)} className="text-sm underline">
              Cancelar
            </button>
          </div>
        </form>
      )}
      {success && <p role="status" className="mt-3 text-sm text-green-800">{success}</p>}
    </section>
  );
}

export default function AdminOngDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ong, setOng] = useState<Ong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOng() {
      try {
        const response = await api.get(`/admin/ongs/${id}`);
        setOng(response.data);
      } catch (err) {
        setError("Não foi possível carregar esta ONG.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOng();
  }, [id]);

  if (loading) {
    return <div className="py-10 text-gray-500 text-center">Carregando...</div>;
  }

  if (error || !ong) {
    return (
      <div className="py-10 text-gray-500 text-center">
        {error || "ONG não encontrada."}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/admin")}
        className="mb-6 font-medium text-blue-700 hover:text-blue-800"
      >
        ← Voltar para lista
      </button>

      <div className="bg-white p-8 border border-gray-200 rounded-xl">
        <h1 className="mb-1 font-bold text-gray-900 text-2xl">{ong.name}</h1>
        {ong.category && (
          <p className="mb-4 text-blue-700 capitalize">{ong.category}</p>
        )}

        <dl className="gap-4 grid grid-cols-1 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{ong.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CNPJ</dt>
            <dd className="text-gray-900">{ong.cnpj || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Telefone</dt>
            <dd className="text-gray-900">{ong.phone || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Avaliação</dt>
            <dd className="text-gray-900">
              ★ {Number(ong.averageRating ?? 0).toFixed(1)} (
              {ong.totalReviews ?? 0} avaliações)
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Cadastrada em</dt>
            <dd className="text-gray-900">
              {new Date(ong.createdAt).toLocaleDateString("pt-BR")}
            </dd>
          </div>
        </dl>

        <div className="mt-6 text-gray-700">
          <h2 className="mb-1 font-semibold text-gray-900">Descrição</h2>
          <p>{ong.description || "Sem descrição cadastrada."}</p>
        </div>
      </div>

      <div className="mt-6"><HistoricoMedalhaBranca ongId={ong.id} /></div>

      <OngModeration key={ong.id} ong={ong} />
    </div>
  );
}
