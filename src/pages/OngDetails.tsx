import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import {
  FaCheckCircle,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaGlobe,
  FaCopy,
} from "react-icons/fa";
import MetaCarousel from "./components/MetaCarousel";
import MetaDetailsModal from "./components/MetaDetailsModal";
import { OngReviews } from "../components/OngReviews";
import { ReportModal } from "../components/ReportModal";
import PublicacoesList from "../components/PublicacoesList";

interface Ong {
  id: number;
  name: string;
  medalhaVerde: boolean;
  email: string;
  cnpj?: string;
  phone?: string;
  description?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  pixKey?: string;
  profileImage?: string;
  category?: string;
  createdAt: string;
  averageRating?: number | string | null;
  totalReviews?: number | null;
}

interface Meta {
  id: number;
  title: string;
  description?: string;
  type: "FINANCEIRA" | "MATERIAL" | "VOLUNTARIADO";
  targetAmount?: number | string;
  currentAmount: number | string;
  targetQuantity?: number;
  currentQuantity: number;
  unit?: string;
  deadline?: string;
  active: boolean;
  ongId: number;
}

export default function OngDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ong, setOng] = useState<Ong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loadingMetas, setLoadingMetas] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    async function fetchOng() {
      try {
        const [ongResponse, metasResponse] = await Promise.all([
          api.get(`/users/ongs/${id}`),
          api.get(`/metas/ong/${id}`),
        ]);

        setOng(ongResponse.data);
        setMetas(metasResponse.data);
      } catch (error) {
        console.error("Erro ao buscar ONG:", error);
        setError("Não foi possível carregar esta ONG.");
      } finally {
        setLoading(false);
        setLoadingMetas(false);
      }
    }

    if (id) {
      fetchOng();
    }
  }, [id]);

  async function handleCopyPix() {
    if (!ong?.pixKey) return;

    try {
      await navigator.clipboard.writeText(ong.pixKey);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar PIX:", error);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-brand-muted">
        Carregando perfil da ONG...
      </div>
    );
  }

  if (error || !ong) {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-red-500">{error || "ONG não encontrada."}</p>

        <button
          onClick={() => navigate("/ongs")}
          className="rounded-lg bg-brand-primary px-5 py-2 font-medium text-brand-onPrimary hover:bg-brand-primaryDark"
        >
          Voltar para ONGs
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Voltar */}
      <button
        onClick={() => navigate("/ongs")}
        className="mb-6 font-medium text-brand-primaryText hover:text-brand-text"
      >
        ← Voltar para ONGs
      </button>

      {/* Cabeçalho */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Foto */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-champagne text-3xl font-bold text-brand-primaryText">
            {ong.profileImage ? (
              <img
                src={ong.profileImage}
                alt={`Logo da ${ong.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              ong.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Informações */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-sans text-brand-text">{ong.name}</h1>

              {ong.medalhaVerde && (
                <span
                  className="flex items-center gap-1 text-sm font-semibold text-green-600"
                  title="Dados cadastrais verificados automaticamente"
                >
                  <FaCheckCircle />
                  CNPJ verificado
                </span>
              )}
            </div>

            {ong.category && (
              <p className="mt-2 capitalize text-brand-goldText">
                {ong.category}
              </p>
            )}

            <p className="mt-1 text-sm text-brand-muted">
              CNPJ: {ong.cnpj || "Não informado"}
            </p>
          </div>
        </div>
      </div>

      {/* Sobre */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        <h2 className="mb-3 text-xl font-sans text-brand-text">Sobre a ONG</h2>

        <p className="leading-relaxed text-brand-muted">
          {ong.description || "Esta ONG ainda não possui uma descrição."}
        </p>
      </div>

      <PublicacoesList ongId={ong.id} />

      {/* Avaliações */}
      <OngReviews
        key={ong.id}
        ongId={ong.id}
        averageRating={ong.averageRating}
        totalReviews={ong.totalReviews}
        onSaved={(result) =>
          setOng((previous) =>
            previous && previous.id === result.id
              ? {
                  ...previous,
                  averageRating: result.averageRating,
                  totalReviews: result.totalReviews,
                }
              : previous,
          )
        }
      />

      {/* Denúncia da ONG */}
      <div className="mb-6 text-right">
        <button
          onClick={() => setReportOpen(true)}
          className="text-sm text-brand-muted underline hover:text-red-600"
        >
          Denunciar ONG
        </button>
      </div>

      {reportOpen && (
        <ReportModal
          targetType="ONG"
          targetId={ong.id}
          targetLabel={ong.name}
          onClose={() => setReportOpen(false)}
        />
      )}

      {/* Como ajudar */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-sans text-brand-text">
          Como você pode ajudar
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-brand-border bg-brand-champagne p-5">
            <h3 className="mb-2 font-bold text-brand-text">
              💰 Doação financeira
            </h3>

            <p className="text-sm leading-relaxed text-brand-muted">
              Contribua financeiramente para ajudar a ONG a manter seus projetos
              e atividades.
            </p>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-champagne p-5">
            <h3 className="mb-2 font-bold text-brand-text">
              📦 Doação de materiais
            </h3>

            <p className="text-sm leading-relaxed text-brand-muted">
              Doe materiais e itens que a ONG realmente precisa para continuar
              seu trabalho.
            </p>
          </div>
        </div>
      </div>

      {/* Contato e PIX */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
          <h2 className="mb-5 text-xl font-sans text-brand-text">
            Informações de contato
          </h2>

          <div className="space-y-4 text-brand-muted">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-brand-gold" />
              <span>{ong.email}</span>
            </div>

            {ong.phone && (
              <div className="flex items-center gap-3">
                <span>☎️</span>
                <span>{ong.phone}</span>
              </div>
            )}

            {ong.whatsapp && (
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-green-600" />
                <span>{ong.whatsapp}</span>
              </div>
            )}

            {ong.instagram && (
              <div className="flex items-center gap-3">
                <FaInstagram className="text-pink-600" />
                <span>{ong.instagram}</span>
              </div>
            )}

            {ong.website && (
              <div className="flex items-center gap-3">
                <FaGlobe className="text-brand-gold" />
                <a
                  href={ong.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primaryText hover:underline"
                >
                  Site da instituição
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
          <h2 className="mb-5 text-xl font-sans text-brand-text">Chave PIX</h2>

          {ong.pixKey ? (
            <>
              <div className="mb-4 break-all rounded-lg bg-brand-champagne p-4 font-mono text-sm text-brand-text">
                {ong.pixKey}
              </div>

              <button
                onClick={handleCopyPix}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 font-medium text-brand-onPrimary transition hover:bg-brand-primaryDark"
              >
                <FaCopy />
                {copied ? "Chave copiada!" : "Copiar chave PIX"}
              </button>
            </>
          ) : (
            <p className="text-brand-muted">
              Esta ONG ainda não cadastrou uma chave PIX.
            </p>
          )}
        </div>
      </div>

      {/* Metas */}
      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-sans text-brand-text">
            Como você pode ajudar
          </h2>

          <p className="mt-1 text-brand-muted">
            Veja as necessidades atuais desta ONG.
          </p>
        </div>

        {loadingMetas ? (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center shadow-sm">
            <p className="text-brand-muted">Carregando metas...</p>
          </div>
        ) : (
          <MetaCarousel
            metas={metas}
            onSelectMeta={(meta) => setSelectedMeta(meta)}
          />
        )}

        {selectedMeta && (
          <MetaDetailsModal
            meta={selectedMeta}
            onClose={() => setSelectedMeta(null)}
          />
        )}
      </div>
    </div>
  );
}
