import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ReviewForm } from "./ReviewForm";
import { ReviewsList } from "./ReviewsList";
import type { SaveReviewResult } from "../types/reviews";

interface OngReviewsProps {
  ongId: number;
  averageRating?: number | string | null;
  totalReviews?: number | null;
  onSaved: (result: SaveReviewResult) => void;
}

export function OngReviews({
  ongId,
  averageRating,
  totalReviews,
  onSaved,
}: OngReviewsProps) {
  const { user } = useAuth();
  const [listVersion, setListVersion] = useState(0);

  const canReview =
    user?.type === "DOADOR" && user.status === "ATIVO";

  function handleSaved(result: SaveReviewResult) {
    onSaved(result);
    setListVersion((previous) => previous + 1);
  }

  return (
    <section className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
      <h2 className="mb-3 font-sans text-xl text-brand-text">
        Avaliações
      </h2>

      <div className="mb-5 flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl text-brand-gold">
          ★
        </span>
        <span className="text-lg font-semibold text-brand-text">
          {Number(averageRating ?? 0).toFixed(1)}
        </span>
        <span className="text-sm text-brand-muted">
          ({totalReviews ?? 0} avaliações)
        </span>
      </div>

      {canReview && user ? (
        <ReviewForm
          key={`${ongId}:${user.id}`}
          ongId={ongId}
          onSaved={handleSaved}
        />
      ) : !user ? (
        <p className="text-sm text-brand-muted">
          <Link to="/auth" className="text-brand-primaryText underline">
            Entre na sua conta
          </Link>{" "}
          de doador para avaliar esta ONG.
        </p>
      ) : (
        <p className="text-sm text-brand-muted">
          Somente doadores com uma conta ativa podem avaliar ONGs.
        </p>
      )}

      <div className="mt-6 border-t border-brand-border pt-6">
        <h3 className="mb-4 font-semibold text-brand-text">
          Avaliações publicadas
        </h3>

        <ReviewsList
          key={`${ongId}:${listVersion}`}
          ongId={ongId}
        />
      </div>
    </section>
  );
}
