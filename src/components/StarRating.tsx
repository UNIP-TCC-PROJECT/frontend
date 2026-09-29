import { useState } from "react";
import { api } from "../services/api";

interface StarRatingProps {
  ongId: string | number;
  currentUserRating?: number;
  onRated: (newAverage: number, newTotal: number) => void;
}

export function StarRating({ ongId, currentUserRating, onRated }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(currentUserRating ?? 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick(nota: number) {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!storedUser || !token) {
      setError("Você precisa estar logado para avaliar.");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.type !== "DOADOR") {
      setError("Somente doadores podem avaliar ONGs.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await api.post(`/users/${ongId}/reviews`, { nota });
      const ongAtualizada = response.data;
      setSelected(nota);
      onRated(ongAtualizada.averageRating, ongAtualizada.totalReviews);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Não foi possível enviar sua avaliação."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <span
            key={estrela}
            onClick={() => !sending && handleClick(estrela)}
            onMouseEnter={() => setHover(estrela)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl cursor-pointer transition ${
              estrela <= (hover || selected) ? "text-yellow-400" : "text-brand-text/20"
            } ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            ★
          </span>
        ))}
      </div>
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}