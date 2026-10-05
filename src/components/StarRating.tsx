import { useEffect, useState } from "react";
import { api } from "../services/api";

interface StarRatingProps {
  ongId: string | number;
  currentUserRating?: number;
  currentUserComment?: string | null;
  onRated: (newAverage: number, newTotal: number) => void;
  onCommented?: () => void;
}

export function StarRating({
  ongId,
  currentUserRating,
  currentUserComment,
  onRated,
  onCommented,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(currentUserRating ?? 0);
  const [comentario, setComentario] = useState(currentUserComment ?? "");
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const hasReview = !!currentUserRating;
  const showForm = !hasReview || editing;

  useEffect(() => {
    if (!editing) {
      setSelected(currentUserRating ?? 0);
      setComentario(currentUserComment ?? "");
    }
  }, [currentUserRating, currentUserComment, editing]);

  function handleAskConfirm() {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!storedUser || !token) {
      setError("Você precisa estar logado para avaliar.");
      return;
    }

    if (JSON.parse(storedUser).type !== "DOADOR") {
      setError("Somente doadores podem avaliar ONGs.");
      return;
    }

    if (!selected) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    setError("");
    setConfirming(true);
  }

  async function handleConfirm() {
    setSending(true);
    setError("");
    setSaved(false);

    try {
      // O backend atualiza a avaliação existente, nunca cria uma segunda.
      const response = await api.post(`/users/${ongId}/reviews`, {
        nota: selected,
        comentario,
      });
      onRated(response.data.averageRating, response.data.totalReviews);
      setEditing(false);
      setSaved(true);
      onCommented?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Não foi possível enviar sua avaliação."
      );
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  function handleStartEdit() {
    setSelected(currentUserRating ?? 0);
    setComentario(currentUserComment ?? "");
    setSaved(false);
    setError("");
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setError("");
  }

  const shown = showForm ? hover || selected : currentUserRating ?? 0;

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <span
            key={estrela}
            onClick={() => showForm && !sending && setSelected(estrela)}
            onMouseEnter={() => showForm && setHover(estrela)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition ${
              estrela <= shown ? "text-yellow-400" : "text-brand-text/20"
            } ${showForm ? "cursor-pointer" : ""}`}
          >
            ★
          </span>
        ))}
      </div>

      {showForm ? (
        <>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={3}
            disabled={sending}
            placeholder="Deixe um comentário (opcional)"
            className="mt-3 w-full rounded-lg border border-brand-text/20 bg-white p-3 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAskConfirm}
              disabled={sending}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-brand-background hover:bg-brand-primaryDark disabled:opacity-60"
            >
              {hasReview ? "Salvar alterações" : "Enviar avaliação"}
            </button>
            {hasReview && (
              <button
                onClick={handleCancelEdit}
                disabled={sending}
                className="rounded-lg px-4 py-2 text-sm text-brand-text/70 hover:bg-brand-text/5"
              >
                Cancelar
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mt-3 rounded-lg border border-brand-text/10 bg-brand-sage p-3">
          <p className="mb-1 text-xs font-medium text-brand-text/60">Sua avaliação</p>
          {currentUserComment && (
            <p className="whitespace-pre-line text-sm text-brand-text/70">{currentUserComment}</p>
          )}
          <button
            onClick={handleStartEdit}
            className="mt-2 text-sm text-brand-primary underline hover:text-brand-primaryDark"
          >
            Editar avaliação
          </button>
        </div>
      )}

      {saved && <p className="mt-1 text-sm text-green-700">Avaliação salva!</p>}
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-brand-surface p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-serif text-brand-text">
              {hasReview ? "Salvar alterações?" : "Enviar avaliação?"}
            </h2>
            <p className="mb-5 text-sm text-brand-text/70">
              {hasReview
                ? "Sua nota e seu comentário atuais serão substituídos."
                : "Sua nota e seu comentário ficarão visíveis no perfil da ONG. Você poderá editá-los depois."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={sending}
                className="rounded-lg px-4 py-2 text-brand-text/70 hover:bg-brand-text/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={sending}
                className="rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-background hover:bg-brand-primaryDark disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
