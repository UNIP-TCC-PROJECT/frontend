import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { errorMessage } from "../../services/organizations";

interface Donor {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  description?: string;
  city?: string;
  state?: string;
  createdAt: string;
  status: "ATIVO" | "SUSPENSO" | "BANIDO";
  contentRestricted: boolean;
}

const actions = {
  RESTRINGIR: {
    label: "Restringir",
    effect: "O doador mantém acesso à conta, mas não poderá iniciar conversas, demonstrar interesse, avaliar ONGs ou criar doações.",
  },
  REMOVER_RESTRICAO: {
    label: "Remover restrição",
    effect: "O doador volta a poder usar as interações da plataforma.",
  },
  SUSPENDER: {
    label: "Suspender",
    effect: "O doador perde o acesso à conta e todas as sessões são encerradas. A suspensão permanece até a reativação.",
  },
  BANIR: {
    label: "Banir",
    effect: "O doador perde o acesso e todas as sessões são encerradas. A reativação exige uma nova ação administrativa.",
  },
  REATIVAR: {
    label: "Reativar conta",
    effect: "O doador volta a poder entrar na conta. Se havia uma restrição, ela continua em vigor.",
  },
};
type Action = keyof typeof actions;
type State = Pick<Donor, "status" | "contentRestricted">;

function DonorModeration({ donor }: { donor: Donor }) {
  const [current, setCurrent] = useState<State>(donor);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const available: Action[] = current.status === "ATIVO"
    ? [current.contentRestricted ? "REMOVER_RESTRICAO" : "RESTRINGIR", "SUSPENDER", "BANIR"]
    : current.status === "SUSPENSO" ? ["REATIVAR", "BANIR"] : ["REATIVAR"];
  const statusLabel = current.status === "ATIVO"
    ? current.contentRestricted ? "Ativo com restrição de interações" : "Ativo"
    : current.status === "SUSPENSO" ? "Suspenso" : "Banido";

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !action || !reason.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch<State>(`/admin/doadores/${donor.id}/moderacao`, {
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
      <p className="mb-4 text-sm text-gray-700">Situação da conta: <strong>{statusLabel}</strong></p>
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
            <button type="submit" disabled={busy || !reason.trim()} className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50">
              {busy ? "Salvando…" : "Confirmar ação"}
            </button>
            <button type="button" disabled={busy} onClick={() => setAction(null)} className="text-sm underline">Cancelar</button>
          </div>
        </form>
      )}
      {success && <p role="status" className="mt-3 text-sm text-green-800">{success}</p>}
    </section>
  );
}

export default function AdminDoadorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get<Donor>(`/admin/doadores/${id}`)
      .then(({ data }) => setDonor(data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <p role="alert" className="py-10 text-gray-500 text-center">{error}</p>;
  if (!donor) return <p className="py-10 text-gray-500 text-center">Carregando doador…</p>;

  return (
    <div>
      <button onClick={() => navigate("/admin/doadores")} className="mb-6 font-medium text-blue-700 hover:text-blue-800">
        ← Voltar para lista de doadores
      </button>
      <section className="bg-white p-8 border border-gray-200 rounded-xl">
        <h1 className="mb-4 font-bold text-gray-900 text-2xl">{donor.name}</h1>
        <dl className="gap-4 grid grid-cols-1 sm:grid-cols-2 text-sm">
          <div><dt className="text-gray-500">E-mail</dt><dd>{donor.email}</dd></div>
          <div><dt className="text-gray-500">CPF</dt><dd>{donor.cpf || "Não informado"}</dd></div>
          <div><dt className="text-gray-500">Telefone</dt><dd>{donor.phone || "Não informado"}</dd></div>
          <div><dt className="text-gray-500">Cidade/UF</dt><dd>{[donor.city, donor.state].filter(Boolean).join("/") || "Não informado"}</dd></div>
          <div><dt className="text-gray-500">Cadastrado em</dt><dd>{new Date(donor.createdAt).toLocaleDateString("pt-BR")}</dd></div>
          <div className="sm:col-span-2"><dt className="text-gray-500">Descrição</dt><dd>{donor.description || "Sem descrição cadastrada."}</dd></div>
        </dl>
      </section>
      <DonorModeration key={donor.id} donor={donor} />
    </div>
  );
}
