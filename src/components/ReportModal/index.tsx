import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/useAuth";

export type ReportTargetType = "ONG" | "DOADOR" | "COMENTARIO";

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: number | string;
  targetLabel: string;
  onClose: () => void;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

export function ReportModal({
  targetType,
  targetId,
  targetLabel,
  onClose,
}: ReportModalProps) {
  const { isLoggedIn, user } = useAuth();

  const [motivo, setMotivo] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const title = targetType === "ONG"
    ? "Denunciar ONG"
    : targetType === "DOADOR"
      ? "Denunciar doador"
      : "Denunciar comentário";
  const requiredAuthorType = targetType === "DOADOR" ? "ONG" : "DOADOR";
  const reporterLabel = requiredAuthorType === "ONG" ? "ONG" : "doador";
  const trimmedLength = motivo.trim().length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (trimmedLength < MIN_LENGTH) {
      setError(`Descreva o motivo com pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }

    setSending(true);
    setError("");

    try {
      await api.post("/denuncias", {
        tipoAlvo: targetType,
        alvoId: Number(targetId),
        motivo: motivo.trim(),
      });
      setSent(true);
    } catch (err: any) {
      const message = err.response?.data?.message;
      // Mantém o motivo digitado para o usuário tentar de novo.
      setError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Não foi possível enviar a denúncia. Tente novamente."
      );
    } finally {
      setSending(false);
    }
  }

  function renderBody() {
    if (!isLoggedIn) {
      return (
        <>
          <p className="mb-6 text-brand-muted">
            Para enviar uma denúncia, entre na sua conta de {reporterLabel}.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-brand-muted hover:bg-brand-text/5"
            >
              Cancelar
            </button>
            <Link
              to="/auth"
              className="rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-onPrimary hover:bg-brand-primaryDark"
            >
              Entrar
            </Link>
          </div>
        </>
      );
    }

    if (user?.type !== requiredAuthorType) {
      return (
        <>
          <p className="mb-6 text-brand-muted">
            Somente {requiredAuthorType === "ONG" ? "ONGs" : "doadores"} podem enviar este tipo de denúncia.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-onPrimary hover:bg-brand-primaryDark"
            >
              Fechar
            </button>
          </div>
        </>
      );
    }

    if (sent) {
      return (
        <>
          <p className="mb-6 text-brand-muted">
            Recebemos sua denúncia. Ela será analisada pela nossa equipe e
            nenhuma ação é aplicada automaticamente. Obrigado por contribuir.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-onPrimary hover:bg-brand-primaryDark"
            >
              Fechar
            </button>
          </div>
        </>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-sm text-brand-muted">
          Você está denunciando: <strong>{targetLabel}</strong>
        </p>

        <label
          htmlFor="report-motivo"
          className="mb-1 block text-sm font-medium text-brand-text"
        >
          Motivo da denúncia
        </label>
        <textarea
          id="report-motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={5}
          disabled={sending}
          placeholder="Explique o que aconteceu"
          className="w-full rounded-lg border border-brand-text/20 bg-white p-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-goldText/30"
        />
        <p className="mt-1 text-right text-xs text-brand-muted">
          {motivo.length}/{MAX_LENGTH}
        </p>

        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg px-4 py-2 text-brand-muted hover:bg-brand-text/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-onPrimary hover:bg-brand-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Confirmar denúncia"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl bg-brand-surface p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-sans text-brand-text">{title}</h2>
        {renderBody()}
      </div>
    </div>
  );
}
