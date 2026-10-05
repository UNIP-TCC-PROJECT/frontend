import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { ReviewsPage } from "../types/reviews";

interface ReviewsListProps {
  ongId: number;
}

export function ReviewsList({ ongId }: ReviewsListProps) {
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

  if (loading) {
    return (
      <p role="status" className="text-sm text-gray-500">
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
          className="mt-2 text-sm text-blue-700 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <p className="text-sm text-gray-500">
        Esta ONG ainda não possui avaliações.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {data.items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Não há avaliações nesta página.
        </p>
      ) : (
        <ul className="space-y-4">
          {data.items.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-gray-800">
                  {review.author.name}
                </p>

                <p
                  aria-label={`Nota ${review.nota} de 5`}
                  className="text-sm text-gray-700"
                >
                  <span aria-hidden="true" className="text-yellow-500">
                    ★
                  </span>{" "}
                  {review.nota}/5
                </p>
              </div>

              {review.comentario && (
                <p className="mt-2 whitespace-pre-wrap break-words text-gray-600">
                  {review.comentario}
                </p>
              )}

              <p className="mt-3 text-xs text-gray-500">
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
            className="rounded-lg border px-3 py-2 text-sm
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {data.page} de {data.totalPages}
          </span>

          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => setPage((previous) => previous + 1)}
            className="rounded-lg border px-3 py-2 text-sm
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}