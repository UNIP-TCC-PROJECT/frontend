import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaCamera,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaGlobe,
  FaCopy,
  FaComments,
  FaPhone,
} from "react-icons/fa";
import { api, imagemUrl } from "../services/api";
import MetaCarousel from "./components/MetaCarousel";
import MetaDetailsModal from "./components/MetaDetailsModal";
import { OngReviews } from "../components/OngReviews";
import { ReportModal } from "../components/ReportModal";
import PublicacoesList from "../components/PublicacoesList";
import FavoritoButton from "../components/FavoritoButton";
import { useAuth } from "../context/useAuth";
import InteresseButton from "../components/InteresseButton";
import { NgoProfileForm } from "./Perfil/components/NgoProfileForm";
import SolicitarMedalhaBranca from "../components/MedalhaBranca";

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

export default function OngDetails({ isOwnProfile = false }: { isOwnProfile?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const profileId = isOwnProfile ? user?.id : id ? Number(id) : undefined;
  const avatarInput = useRef<HTMLInputElement>(null);

  const [ong, setOng] = useState<Ong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loadingMetas, setLoadingMetas] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [erroConversa, setErroConversa] = useState("");
  const [abrindoConversa, setAbrindoConversa] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const isOwner = user?.type === "ONG" && ong?.id === user.id;

  useEffect(() => {
    async function fetchOng() {
      try {
        const [ongResponse, metasResponse] = await Promise.all([
          api.get(`/users/ongs/${profileId}`),
          api.get(`/metas/ong/${profileId}`),
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

    if (profileId) {
      fetchOng();
    }
  }, [profileId]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOwner) return;
    setAvatarError("");
    if (!/^image\/(jpe?g|png|webp)$/.test(file.type)) {
      setAvatarError("Selecione uma imagem JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("A imagem deve ter no máximo 2 MB.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    setSavingAvatar(true);
    try {
      const { data } = await api.post<{ profileImage: string }>("/users/me/avatar", form);
      updateUser({ profileImage: data.profileImage });
      setOng((previous) => previous ? { ...previous, profileImage: data.profileImage } : previous);
    } catch (error) {
      console.error("Erro ao atualizar a imagem da ONG:", error);
      setAvatarError("Não foi possível atualizar a imagem. Tente novamente.");
    } finally {
      setSavingAvatar(false);
    }
  }

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

  async function iniciarConversa() {
    if (!ong) return;
    setAbrindoConversa(true);
    setErroConversa("");
    try {
      const { data } = await api.post<{ id: number }>(`/conversas/ongs/${ong.id}`);
      navigate(`/conversas/${data.id}`);
    } catch {
      setErroConversa("Não foi possível iniciar a conversa. Tente novamente.");
    } finally {
      setAbrindoConversa(false);
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
      {!isOwner && (
        <button
          onClick={() => navigate("/ongs")}
          className="mb-6 font-medium text-brand-primaryText hover:text-brand-text"
        >
          ← Voltar para ONGs
        </button>
      )}

      {/* Cabeçalho */}
      <div className="relative mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        {user?.type === "DOADOR" && user.status === "ATIVO" && (
          <div className="absolute right-4 top-4 z-10">
            <FavoritoButton ongId={ong.id} iconOnly />
          </div>
        )}

        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Foto */}
          <div className="relative h-24 w-24 shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-brand-champagne text-3xl font-bold text-brand-primaryText">
              {ong.profileImage ? (
                <img
                  src={imagemUrl(ong.profileImage) ?? ""}
                  alt={`Logo da ${ong.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                ong.name.charAt(0).toUpperCase()
              )}
            </div>
            {isOwner && (
              <>
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  aria-label="Alterar imagem da ONG"
                  title="Alterar imagem da ONG"
                  disabled={savingAvatar}
                  onClick={() => avatarInput.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-primary text-brand-onPrimary shadow disabled:opacity-60"
                >
                  <FaCamera className="text-xs" />
                </button>
              </>
            )}
          </div>

          {/* Informações */}
          <div className="min-w-0 pr-10 sm:pr-0">
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

      {isOwner && (
        <>
          <section className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand-text">Gerenciar perfil da ONG</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Atualize as informações públicas e acesse as ferramentas da sua organização.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile((current) => !current)}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary hover:bg-brand-primaryDark"
              >
                {editingProfile ? "Fechar edição" : "Editar informações"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/publicacoes"
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-primaryText hover:bg-brand-champagne"
              >
                Criar publicação
              </Link>
              <Link
                to="/minhas-metas"
                className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-primaryText hover:bg-brand-champagne"
              >
                Gerenciar metas
              </Link>
            </div>
            {avatarError && <p role="alert" className="mt-3 text-sm text-red-600">{avatarError}</p>}
            {savingAvatar && <p role="status" className="mt-3 text-sm text-brand-muted">Atualizando imagem...</p>}
          </section>

          {editingProfile && (
            <section className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm sm:p-8">
              <h2 className="mb-5 text-xl font-sans text-brand-text">Editar informações da ONG</h2>
              <NgoProfileForm
                profile={{ ...ong, type: "ONG" }}
                onSaved={(updated) => {
                  setOng((previous) => previous ? { ...previous, ...updated } : previous);
                  setEditingProfile(false);
                }}
                onCancel={() => setEditingProfile(false)}
              />
            </section>
          )}

          <SolicitarMedalhaBranca />
        </>
      )}

      {user?.type === "DOADOR" && user.status === "ATIVO" && (
        <section className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <InteresseButton ongId={ong.id} />
          <button
            type="button"
            onClick={() => void iniciarConversa()}
            disabled={abrindoConversa}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-primary px-5 py-3 font-semibold text-brand-primaryText transition hover:bg-brand-champagne disabled:opacity-60"
          >
            <FaComments aria-hidden="true" />
            {abrindoConversa ? "Abrindo conversa..." : "Conversar com a ONG"}
          </button>
          {erroConversa && <p role="alert" className="basis-full text-sm text-red-600">{erroConversa}</p>}
        </section>
      )}

      {/* Sobre */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        <h2 className="mb-3 text-xl font-sans text-brand-text">Sobre a ONG</h2>

        <p className="leading-relaxed text-brand-muted">
          {ong.description || "Esta ONG ainda não possui uma descrição."}
        </p>
      </div>

      <PublicacoesList
        ongId={ong.id}
        ongName={ong.name}
        profileImage={ong.profileImage}
      />

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
      {!isOwner && (
        <div className="mb-6 text-right">
          <button
            onClick={() => setReportOpen(true)}
            className="text-sm text-brand-muted underline hover:text-red-600"
          >
            Denunciar ONG
          </button>
        </div>
      )}

      {reportOpen && (
        <ReportModal
          targetType="ONG"
          targetId={ong.id}
          targetLabel={ong.name}
          onClose={() => setReportOpen(false)}
        />
      )}


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
              <FaPhone className="phone" />
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
