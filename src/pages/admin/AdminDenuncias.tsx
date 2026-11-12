import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import { errorMessage } from "../../services/organizations";

type Status = "PENDENTE" | "EM_ANALISE" | "PROCEDENTE" | "IMPROCEDENTE";
type TargetType = "ONG" | "DOADOR" | "COMENTARIO";

interface Report {
  id: number;
  autor?: { id: number; name: string; type?: "ONG" | "DOADOR" | "ADMIN" };
  tipoAlvo: TargetType;
  alvoId: number;
  motivo: string;
  contexto: Record<string, unknown>;
  status: Status;
  reviewNote: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
}

const statusLabel: Record<Status, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em análise",
  PROCEDENTE: "Procedente",
  IMPROCEDENTE: "Improcedente",
};

const statusStyle: Record<Status, string> = {
  PENDENTE: "bg-amber-100 text-amber-900",
  EM_ANALISE: "bg-blue-100 text-blue-900",
  PROCEDENTE: "bg-green-100 text-green-900",
  IMPROCEDENTE: "bg-slate-100 text-slate-700",
};

function contextLines(report: Report): Array<[string, unknown]> {
  const context = report.contexto ?? {};
  if (report.tipoAlvo === "ONG") {
    const lines: Array<[string, unknown]> = [
      ["Instituição", context.nome],
      ["Situação da conta", context.statusConta],
      ["Descrição registrada", context.descricao],
    ];
    return lines.filter(([, value]) => typeof value === "string" && value.trim());
  }
  if (report.tipoAlvo === "DOADOR") {
    const lines: Array<[string, unknown]> = [
      ["Doador", context.nome],
      ["Situação da conta", context.statusConta],
    ];
    return lines.filter(([, value]) => typeof value === "string" && value.trim());
  }
  const lines: Array<[string, unknown]> = [
    ["ONG relacionada", context.ongNome],
    ["Autor do comentário", context.autorComentarioNome],
    ["Nota", context.nota],
    ["Comentário denunciado", context.comentario],
  ];
  return lines.filter(([, value]) => value !== null && value !== undefined && value !== "");
}

function ReportCard({ report, onUpdated }: { report: Report; onUpdated: () => void }) {
  const [note, setNote] = useState(report.reviewNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = report.status === "PENDENTE" || report.status === "EM_ANALISE";
  const ongId = report.tipoAlvo === "ONG" ? report.alvoId : report.contexto?.ongId;
  const targetLabel = report.tipoAlvo === "ONG"
    ? "ONG"
    : report.tipoAlvo === "DOADOR"
      ? "doador"
      : "comentário";
  const authorTypeLabel = report.autor?.type === "ONG" ? "ONG" : "doador";

  async function decide(decision: Status) {
    setError("");
    if (decision !== "EM_ANALISE" && !note.trim()) {
      setError("Informe a justificativa para concluir a análise.");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/admin/denuncias/${report.id}/decision`, {
        decision,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      onUpdated();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">
            Denúncia #{report.id} · {targetLabel}
          </h2>
          <p className="text-sm text-slate-600">
            Enviada por {report.autor?.name ?? "usuário"} ({authorTypeLabel}) · alvo #{report.alvoId} ·{" "}
            {new Date(report.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[report.status]}`}>
          {statusLabel[report.status]}
        </span>
      </header>

      <section className="space-y-2 rounded-lg bg-slate-50 p-4">
        <h3 className="font-medium text-slate-800">Contexto do alvo</h3>
        {contextLines(report).map(([label, value]) => (
          <p key={label} className="text-sm text-slate-700">
            <strong>{label}:</strong> {String(value)}
          </p>
        ))}
      </section>

      {typeof ongId === "number" && (
        <Link className="inline-block text-sm font-medium text-blue-700 underline" to={`/admin/ongs/${ongId}`}>
          Abrir ficha da ONG
        </Link>
      )}

      <section>
        <h3 className="font-medium text-slate-800">Motivo informado</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report.motivo}</p>
      </section>

      {report.reviewNote && !open && (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <strong>Decisão registrada:</strong> {report.reviewNote}
          {report.reviewedAt && ` · ${new Date(report.reviewedAt).toLocaleString("pt-BR")}`}
          {report.reviewedBy && ` · administrador #${report.reviewedBy}`}
        </p>
      )}

      {open && (
        <>
          <label className="block text-sm text-slate-700">
            Justificativa da análise
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              placeholder="Obrigatória para concluir como procedente ou improcedente"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || report.status === "EM_ANALISE"}
              onClick={() => void decide("EM_ANALISE")}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Iniciar análise
            </button>
            <button
              disabled={busy}
              onClick={() => void decide("PROCEDENTE")}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Marcar procedente
            </button>
            <button
              disabled={busy}
              onClick={() => void decide("IMPROCEDENTE")}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Marcar improcedente
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default function AdminDenuncias() {
  const [params] = useSearchParams();
  const ongId = params.get("ongId");
  return <ReportList key={ongId ?? "geral"} ongId={ongId} />;
}

function ReportList({ ongId }: { ongId: string | null }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState(ongId ? "TODAS" : "ABERTAS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter === "ABERTAS" ? {} : filter === "TODAS" ? { all: "true" } : { status: filter };
      setReports((await api.get<Report[]>("/admin/denuncias", {
        params: { ...params, ...(ongId ? { ongId } : {}) },
      })).data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter, ongId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Análise de denúncias</h1>
          <p className="mt-1 text-sm text-slate-600">
            Consulte o contexto enviado e registre a conclusão administrativa. A decisão fica no histórico de auditoria.
          </p>
        </div>
        <select
          aria-label="Filtrar denúncias por situação"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="ABERTAS">Pendentes e em análise</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="EM_ANALISE">Em análise</option>
          <option value="PROCEDENTE">Procedentes</option>
          <option value="IMPROCEDENTE">Improcedentes</option>
          <option value="TODAS">Todas</option>
        </select>
      </header>

      {ongId && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span>Denúncias relacionadas à ONG #{ongId}</span>
          <Link className="text-blue-700 underline" to={`/admin/ongs/${ongId}`}>Voltar à ficha</Link>
          <Link className="text-blue-700 underline" to="/admin/denuncias">Ver todas as ONGs</Link>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? (
        <p className="py-8 text-center text-slate-500">Carregando denúncias…</p>
      ) : error ? null : reports.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Nenhuma denúncia encontrada para este filtro.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => <ReportCard key={report.id} report={report} onUpdated={() => void load()} />)}
        </div>
      )}
    </section>
  );
}
