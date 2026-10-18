import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/useAuth";
import { ReportModal } from "./ReportModal";
import type {
  ReviewsPage,
  PublicReview,
  MyReviewResponse,
} from "../types/reviews";

interface ReviewsListProps {
  ongId: number;
}

export function ReviewsList({ ongId }: ReviewsListProps) {
  const { user } = useAuth();

  const [reportReview, setReportReview] = useState<PublicReview | null>(null);

  const [myReviewId, setMyReviewId] = useState<number | null>(null);
  const [myReviewError, setMyReviewError] = useState("");
  const [myReviewLoaded, setMyReviewLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

useEffect(() => {
  const controller = new AbortController();

  setLoading(true);
  setError("");

  async function loadReviews() {
    try {
      const response = await api.get<ReviewsPage>(
        `/users/${ongId}/reviews`,
        {
          params: { page, limit: 5 },
          signal: controller.signal,
        },
      );

      if (!controller.signal.aborted) {
        setData(response.data);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError("Não foi possível carregar as avaliações.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadReviews();

  return () => controller.abort();
}, [ongId, page, attempt]);

// Identifica a avaliação do doador autenticado.
useEffect(() => {
  const controller = new AbortController();

  setMyReviewId(null);
  setMyReviewLoaded(false);
  setMyReviewError("");
  setReportReview(null);

  if (user?.type !== "DOADOR" || user.status !== "ATIVO") {
    setMyReviewLoaded(true);
    return () => controller.abort();
  }

  async function loadMyReviewId() {
    try {
      const response = await api.get<MyReviewResponse>(
        `/users/${ongId}/reviews/me`,
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      setMyReviewId(response.data.review?.id ?? null);
      setMyReviewLoaded(true);
    } catch {
      if (controller.signal.aborted) return;

      setMyReviewError(
        "Não foi possível identificar sua avaliação. Tente novamente.",
      );
    }
  }

  void loadMyReviewId();

  return () => controller.abort();
}, [ongId, user?.id, user?.type, user?.status, attempt]);

  if (loading) {
    return (
      <p role="status" className="text-sm text-brand-muted">
        Carregando avaliações...
      </p>
    );
  }

  if (error) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
        <button
          type="button"
          onClick={() => setAttempt((previous) => previous + 1)}
          className="mt-2 text-sm text-brand-primaryText underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <p className="text-sm text-brand-muted">
        Esta ONG ainda não possui avaliações.
      </p>
    );
  }

return (
  <div className="space-y-5">
    {myReviewError && (
      <div>
        <p role="alert" className="text-sm text-red-600">
          {myReviewError}
        </p>
        <button
          type="button"
          onClick={() => setAttempt((previous) => previous + 1)}
          className="mt-2 text-sm text-brand-primaryText underline"
        >
          Tentar novamente
        </button>
      </div>
    )}

    {data.items.length === 0 ? (
      <p className="text-sm text-brand-muted">
        Não há avaliações nesta página.
      </p>
    ) : (
      <ul className="space-y-4">
        {data.items.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-brand-border bg-brand-champagne p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-brand-text">
                {review.author.name}
              </p>

              <p
                aria-label={`Nota ${review.nota} de 5`}
                className="text-sm text-brand-text"
              >
                <span aria-hidden="true" className="text-brand-gold">
                  ★
                </span>{" "}
                {review.nota}/5
              </p>
            </div>

            {review.comentario && (
              <>
                <p className="mt-2 whitespace-pre-wrap break-words text-brand-muted">
                  {review.comentario}
                </p>

                <div className="mt-2">
                  {myReviewLoaded && review.id === myReviewId ? (
                    <span className="text-xs text-brand-muted">
                      Seu comentário
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!myReviewLoaded}
                      onClick={() => setReportReview(review)}
                      className="text-xs text-brand-muted underline
                        hover:text-red-600 disabled:cursor-not-allowed
                        disabled:opacity-50"
                    >
                      Denunciar comentário
                    </button>
                  )}
                </div>
              </>
            )}

            <p className="mt-3 text-xs text-brand-muted">
              Publicada em{" "}
              <time dateTime={review.createdAt}>
                {new Date(review.createdAt).toLocaleDateString("pt-BR")}
              </time>

              {review.updatedAt !== review.createdAt && (
                <>
                  {" · Atualizada em "}
                  <time dateTime={review.updatedAt}>
                    {new Date(review.updatedAt).toLocaleDateString("pt-BR")}
                  </time>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    )}

    {data.totalPages > 1 && (
      <nav
        aria-label="Páginas das avaliações"
        className="flex items-center justify-between gap-3"
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((previous) => previous - 1)}
          className="rounded-lg border border-brand-text/20 px-3 py-2
            text-sm text-brand-text disabled:cursor-not-allowed
            disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-brand-muted">
          Página {data.page} de {data.totalPages}
        </span>

        <button
          type="button"
          disabled={page >= data.totalPages}
          onClick={() => setPage((previous) => previous + 1)}
          className="rounded-lg border border-brand-text/20 px-3 py-2
            text-sm text-brand-text disabled:cursor-not-allowed
            disabled:opacity-50"
        >
          Próxima
        </button>
      </nav>
    )}

    {reportReview && (
      <ReportModal
        key={reportReview.id}
        targetType="COMENTARIO"
        targetId={reportReview.id}
        targetLabel={`Comentário de ${reportReview.author.name}`}
        onClose={() => setReportReview(null)}
      />
    )}
  </div>
);
}
