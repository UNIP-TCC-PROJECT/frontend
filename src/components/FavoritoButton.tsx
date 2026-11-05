import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { api } from "../services/api";

interface FavoritoButtonProps {
  ongId: number;
  onChange?: (favoritada: boolean) => void;
  iconOnly?: boolean;
  className?: string;
}

export default function FavoritoButton({
  ongId,
  onChange,
  iconOnly = false,
  className,
}: FavoritoButtonProps) {
  const [favoritada, setFavoritada] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    api
      .get<{ favoritada: boolean }>(`/favoritos/${ongId}/status`)
      .then(({ data }) => {
        if (ativo) setFavoritada(data.favoritada);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível verificar o favorito.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [ongId]);

  async function alternarFavorito() {
    setAtualizando(true);
    setErro("");

    try {
      if (favoritada) {
        await api.delete(`/favoritos/${ongId}`);
        setFavoritada(false);
        onChange?.(false);
      } else {
        await api.post(`/favoritos/${ongId}`);
        setFavoritada(true);
        onChange?.(true);
      }
    } catch {
      setErro("Não foi possível atualizar o favorito.");
    } finally {
      setAtualizando(false);
    }
  }

  const label = carregando
    ? "Verificando favorito"
    : favoritada
      ? "Remover dos favoritos"
      : "Favoritar ONG";

  return (
    <div>
      <button
        type="button"
        onClick={alternarFavorito}
        disabled={carregando || atualizando || Boolean(erro)}
        aria-pressed={favoritada}
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        className={
          iconOnly
            ? "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-border bg-brand-surface text-lg text-brand-gold shadow-sm transition-colors hover:bg-brand-champagne disabled:cursor-not-allowed disabled:opacity-60"
            : className ?? "inline-flex items-center gap-2 border-2 border-[#A51645] bg-[#FFD43B] px-3 py-2 font-bold text-[#A51645] shadow-[3px_3px_0_#5B4210] disabled:opacity-60"
        }
      >
        {favoritada ? (
          <FaStar aria-hidden="true" />
        ) : (
          <FaRegStar aria-hidden="true" />
        )}
        {iconOnly ? (
          <span className="sr-only">{label}</span>
        ) : carregando ? (
          "Verificando..."
        ) : favoritada ? (
          "Remover dos favoritos"
        ) : (
          "Favoritar ONG"
        )}
      </button>

      {erro && (
        <p
          role="alert"
          className={iconOnly ? "sr-only" : "mt-2 text-sm text-red-600"}
        >
          {erro}
        </p>
      )}
    </div>
  );
}
