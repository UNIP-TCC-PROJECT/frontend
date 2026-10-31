import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import {
  FaCheckCircle,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaGlobe,
  FaCopy,
  FaComments,
} from "react-icons/fa";
import MetaCarousel from "./components/MetaCarousel";
import MetaDetailsModal from "./components/MetaDetailsModal";
import { OngReviews } from "../components/OngReviews";
import { ReportModal } from "../components/ReportModal";
import PublicacoesList from "../components/PublicacoesList";
import FavoritoButton from "../components/FavoritoButton";
import { useAuth } from "../context/useAuth";
import InteresseButton from "../components/InteresseButton";
import { Tabs } from "../components/Tabs";
import LevelBadge from "../components/transparency/LevelBadge";
import ValidationStatus from "../components/transparency/ValidationStatus";
import TransparenciaTab from "../components/transparency/TransparenciaTab";
import DocumentosTab from "../components/transparency/DocumentosTab";
import TimelineTab from "../components/transparency/TimelineTab";
import SecurityInfo from "../components/transparency/SecurityInfo";
import { fmtDay, loadProfile, orgIdOfOwner } from "../services/transparency";
import type { TransparencyProfile } from "../services/transparency";
import { imagemUrl } from "../services/api";
import { fmtCnpj } from "../services/organizations";

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
  coverImage?: string | null;
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

const ABAS = [
  { id: "sobre", label: "Sobre" },
  { id: "transparencia", label: "Transparência" },
  { id: "publicacoes", label: "Publicações" },
  { id: "documentos", label: "Documentos" },
  { id: "historico", label: "Linha do tempo" },
  { id: "seguranca", label: "Segurança" },
];

function TabEmpty({ state }: { state: "loading" | "ok" | "none" | "error" }) {
  const text =
    state === "loading" ? "Carregando…"
    : state === "error" ? "Não foi possível carregar estas informações agora. Tente novamente em instantes."
    : "Esta instituição ainda não concluiu a validação da plataforma, por isso não há informações de transparência analisadas para exibir.";
  return <p className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-brand-muted" aria-live="polite">{text}</p>;
}

export default function OngDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [params, setParams] = useSearchParams();
  const aba = ABAS.some((a) => a.id === params.get("aba")) ? (params.get("aba") as string) : "sobre";
  const [profile, setProfile] = useState<TransparencyProfile | null>(null);
  const [profileState, setProfileState] = useState<"loading" | "ok" | "none" | "error">("loading");

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

  // Perfil de transparência: só existe para ONG com organização aprovada (404 = validação não concluída).
  useEffect(() => {
    if (!ong) return;
    let ativo = true;
    setProfileState("loading");
    orgIdOfOwner(ong.id)
      .then(loadProfile)
      .then((p) => { if (ativo) { setProfile(p); setProfileState("ok"); } })
      .catch((e) => { if (ativo) setProfileState(e?.response?.status === 404 ? "none" : "error"); });
    return () => { ativo = false; };
  }, [ong]);

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
      {/* Voltar */}
      <button
        onClick={() => navigate("/ongs")}
        className="mb-6 font-medium text-brand-primaryText hover:text-brand-text"
      >
        ← Voltar para ONGs
      </button>

      {/* Cabeçalho: capa, foto, status da validação e nível de transparência */}
      <header className="relative mb-6 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm">
        <div className="h-36 w-full bg-gradient-to-r from-brand-champagne to-brand-primary/40 sm:h-52">
          {ong.coverImage && <img src={imagemUrl(ong.coverImage) ?? ""} alt="" className="h-full w-full object-cover" />}
        </div>

        {user?.type === "DOADOR" && user.status === "ATIVO" && (
          <div className="absolute right-4 top-4 z-10">
            <FavoritoButton ongId={ong.id} iconOnly />
          </div>
        )}

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-brand-surface bg-brand-champagne text-3xl font-bold text-brand-primaryText shadow-sm">
              {ong.profileImage ? (
                <img src={imagemUrl(ong.profileImage) ?? ong.profileImage} alt={`Logo da ${ong.name}`} className="h-full w-full object-cover" />
              ) : (
                ong.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-sans text-brand-text">{ong.name}</h1>
                {ong.medalhaVerde && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600" title="Dados cadastrais verificados automaticamente">
                    <FaCheckCircle />
                    CNPJ verificado
                  </span>
                )}
              </div>
              {ong.category && <p className="capitalize text-brand-goldText">{ong.category}</p>}
              <p className="mt-1 text-sm text-brand-muted">
                CNPJ: {ong.cnpj ? fmtCnpj(ong.cnpj) : "Não informado"} · Na plataforma desde {fmtDay(ong.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {profile && <LevelBadge level={profile.transparencyLevel} />}
            {profileState === "loading" && <p className="text-sm text-brand-muted" aria-live="polite">Carregando informações de transparência…</p>}
            {profileState === "error" && <p role="alert" className="text-sm text-red-600">Não foi possível carregar as informações de transparência agora.</p>}
            {(profileState === "ok" || profileState === "none") && <ValidationStatus profile={profile} />}
          </div>
        </div>
      </header>

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

      <div className="mb-6 overflow-x-auto">
        <div className="min-w-[36rem]">
          <Tabs
            ariaLabel="Seções do perfil da ONG"
            activeId={aba}
            onChange={(id) => setParams(id === "sobre" ? {} : { aba: id }, { replace: true })}
            tabs={ABAS}
          />
        </div>
      </div>

      <div className="mb-10">
        <section id="tabpanel-sobre" role="tabpanel" aria-labelledby="tab-sobre" hidden={aba !== "sobre"} className="space-y-6">
          {aba === "sobre" && (
            <>
      {/* Sobre */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
        <h2 className="mb-3 text-xl font-sans text-brand-text">Sobre a ONG</h2>

        <p className="leading-relaxed text-brand-muted">
          {ong.description || "Esta ONG ainda não possui uma descrição."}
        </p>
      </div>

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

            </>
          )}
        </section>
        <section id="tabpanel-transparencia" role="tabpanel" aria-labelledby="tab-transparencia" hidden={aba !== "transparencia"} className="space-y-6">
          {aba === "transparencia" && (
            <>
              {profile ? <TransparenciaTab profile={profile} /> : <TabEmpty state={profileState} />}
            </>
          )}
        </section>
        <section id="tabpanel-publicacoes" role="tabpanel" aria-labelledby="tab-publicacoes" hidden={aba !== "publicacoes"} className="space-y-6">
          {aba === "publicacoes" && (
            <>
              <PublicacoesList ongId={ong.id} />
            </>
          )}
        </section>
        <section id="tabpanel-documentos" role="tabpanel" aria-labelledby="tab-documentos" hidden={aba !== "documentos"} className="space-y-6">
          {aba === "documentos" && (
            <>
              {profile ? <DocumentosTab profile={profile} /> : <TabEmpty state={profileState} />}
            </>
          )}
        </section>
        <section id="tabpanel-historico" role="tabpanel" aria-labelledby="tab-historico" hidden={aba !== "historico"} className="space-y-6">
          {aba === "historico" && (
            <>
              {profile ? <TimelineTab timeline={profile.timeline} /> : <TabEmpty state={profileState} />}
            </>
          )}
        </section>
        <section id="tabpanel-seguranca" role="tabpanel" aria-labelledby="tab-seguranca" hidden={aba !== "seguranca"} className="space-y-6">
          {aba === "seguranca" && (
            <>
              <SecurityInfo />
            </>
          )}
        </section>
      </div>

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

    </div>
  );
}
