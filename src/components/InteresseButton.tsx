import { useEffect, useState } from "react";
import { FaHandHoldingHeart } from "react-icons/fa";
import { api } from "../services/api";

interface InteresseButtonProps {
  ongId: number;
}

export default function InteresseButton({ ongId }: InteresseButtonProps) {
  const [interessado, setInteressado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");

    api
      .get<{ interessado: boolean }>(`/interesses/${ongId}/status`)
      .then(({ data }) => {
        if (ativo) setInteressado(data.interessado);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível consultar seu interesse.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [ongId]);

  async function alternarInteresse() {
    setAtualizando(true);
    setErro("");
    try {
      if (interessado) {
        await api.delete(`/interesses/${ongId}`);
        setInteressado(false);
      } else {
        await api.post(`/interesses/${ongId}`);
        setInteressado(true);
      }
    } catch {
      setErro("Não foi possível atualizar seu interesse. Tente novamente.");
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={alternarInteresse}
        disabled={carregando || atualizando}
        aria-pressed={interessado}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 font-semibold text-brand-onPrimary transition hover:bg-brand-primaryDark disabled:cursor-wait disabled:opacity-60"
      >
        <FaHandHoldingHeart aria-hidden="true" />
        {carregando
          ? "Verificando interesse..."
          : atualizando
            ? "Atualizando..."
            : interessado
              ? "Cancelar interesse em ajudar"
              : "Demonstrar interesse"}
      </button>
      {erro && <p role="alert" className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
