import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { api } from "../services/api";
import { StarRatingInput } from "./StarRatingInput";
import type { MyReviewResponse, SaveReviewResult } from "../types/reviews";

interface ReviewFormProps {
  ongId: number;
  onSaved: (result: SaveReviewResult) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }

  return fallback;
}

export function ReviewForm({ ongId, onSaved }: ReviewFormProps) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [hasReview, setHasReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attempt, setAttempt] = useState(0);

  const submitting = useRef(false);
  const requestController = useRef<AbortController | null>(null);

  const normalizedComment = comentario.trim();
  const characterCount = Array.from(normalizedComment).length;
  const busy = saving || deleting;

  useEffect(() => {
    const controller = new AbortController();
    requestController.current = controller;

    setLoading(true);
    setLoadError("");
    setError("");
    setSuccess("");

    async function loadMyReview() {
      try {
        const response = await api.get<MyReviewResponse>(
          `/users/${ongId}/reviews/me`,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        const review = response.data.review;

        setNota(review?.nota ?? 0);
        setComentario(review?.comentario ?? "");
        setHasReview(review !== null);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        setLoadError(
          getErrorMessage(error, "Não foi possível carregar sua avaliação."),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadMyReview();

    return () => controller.abort();
  }, [ongId, attempt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current || loading || loadError) return;

    setError("");
    setSuccess("");

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      setError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (characterCount > 100) {
      setError("O comentário deve ter no máximo 100 caracteres.");
      return;
    }

    const controller = requestController.current;
    if (!controller || controller.signal.aborted) return;

    submitting.current = true;
    setSaving(true);

    try {
      const response = await api.post<SaveReviewResult>(
        `/users/${ongId}/reviews`,
        {
          nota,
          comentario: normalizedComment || null,
        },
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      setComentario(normalizedComment);
      setHasReview(true);
      setSuccess("Avaliação salva com sucesso!");
      onSaved(response.data);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      setError(
        getErrorMessage(
          error,
          "Não foi possível salvar. Seu texto foi preservado; tente novamente.",
        ),
      );
    } finally {
      submitting.current = false;
      if (!controller.signal.aborted) setSaving(false);
    }
  }

    async function handleDelete() {
    if (
      submitting.current ||
      loading ||
      loadError ||
      !hasReview
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Excluir sua avaliação? A nota e o comentário serão removidos. " +
      "Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    const controller = requestController.current;
    if (!controller || controller.signal.aborted) return;

    submitting.current = true;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.delete<SaveReviewResult>(
        `/users/${ongId}/reviews/me`,
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      setNota(0);
      setComentario("");
      setHasReview(false);
      setSuccess("Avaliação excluída com sucesso!");
      onSaved(response.data);
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      setError(
        getErrorMessage(
          error,
          "Não foi possível excluir sua avaliação. Tente novamente.",
        ),
      );
    } finally {
      submitting.current = false;
      if (!controller.signal.aborted) setDeleting(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="text-sm text-brand-text/60">
        Carregando sua avaliação...
      </p>
    );
  }

  if (loadError) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => setAttempt((previous) => previous + 1)}
          className="mt-2 text-sm text-brand-primary underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <legend className="mb-3 font-medium text-brand-text/80">
          {hasReview ? "Editar sua avaliação" : "Deixe sua avaliação"}
        </legend>

        <StarRatingInput value={nota} onChange={setNota} disabled={busy} />

        <label className="block">
          <span className="mb-2 block text-sm text-brand-text/80">
            Comentário sobre sua experiência (opcional)
          </span>
          <textarea
            value={comentario}
            onChange={(event) => {
              setComentario(event.target.value);
              setSuccess("");
            }}
            rows={3}
            aria-describedby="review-comment-counter"
            aria-invalid={characterCount > 100}
            placeholder="Conte brevemente como foi sua experiência."
            className="w-full rounded-lg border border-brand-text/20 bg-brand-surface p-3
              text-brand-text placeholder:text-brand-text/50
              focus:border-brand-primary focus:outline-none
              disabled:opacity-60"
          />
        </label>

        <p
          id="review-comment-counter"
          className={`text-right text-sm ${
            characterCount > 100 ? "text-red-600" : "text-brand-text/60"
          }`}
        >
          {characterCount}/100 caracteres
        </p>

        {hasReview && (
          <p className="text-sm text-brand-text/60">
            Para remover seu comentário, apague o texto e salve. Sua nota será
            mantida se você não alterar as estrelas.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy || characterCount > 100}
            className="rounded-lg bg-brand-primary px-5 py-2 font-medium
              text-brand-background hover:bg-brand-primaryDark
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar avaliação"}
          </button>

          {hasReview && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg border border-red-600 px-5 py-2
                font-medium text-red-600 hover:bg-red-50
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Excluindo..." : "Excluir avaliação"}
            </button>
          )}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-700">
          {success}
        </p>
      )}
    </form>
  );
}
