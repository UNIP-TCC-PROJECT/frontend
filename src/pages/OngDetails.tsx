import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import {
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
import ValidationStatus, {
  HistoricoValidacao,
} from "../components/transparency/ValidationStatus";
import TransparenciaTab from "../components/transparency/TransparenciaTab";
import DocumentosTab from "../components/transparency/DocumentosTab";
import TimelineTab from "../components/transparency/TimelineTab";
import SecurityInfo from "../components/transparency/SecurityInfo";
import { fmtDay, loadProfile, orgIdOfOwner } from "../services/transparency";
import type { TransparencyProfile } from "../services/transparency";
import { imagemUrl } from "../services/api";
import { fmtCnpj } from "../services/organizations";
import {
  CadastroVerificadoChip,
  CadastroVerificadoPanel,
  NivelTransparenciaChip,
} from "../components/selos/SelosDaOng";
import { carregarSelos } from "../services/selos";
import type { SelosOng } from "../services/selos";

interface Ong {
  id: number;
  name: string;
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
    state === "loading"
      ? "Carregando…"
      : state === "error"
        ? "Não foi possível carregar estas informações agora. Tente novamente em instantes."
        : "Esta instituição ainda não concluiu a validação da plataforma, por isso não há informações de transparência analisadas para exibir.";
  return (
    <p
      className="bg-brand-surface p-6 border border-brand-border rounded-2xl text-brand-muted"
      aria-live="polite"
    >
      {text}
    </p>
  );
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
  const aba = ABAS.some((a) => a.id === params.get("aba"))
    ? (params.get("aba") as string)
    : "sobre";
  const [profile, setProfile] = useState<TransparencyProfile | null>(null);
  const [profileState, setProfileState] = useState<
    "loading" | "ok" | "none" | "error"
  >("loading");
  const [selos, setSelos] = useState<SelosOng | undefined>();

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

  // Medalhas (cadastro verificado e nível de transparência): endpoint próprio; sem ele o perfil continua funcionando.
  useEffect(() => {
    if (!ong) return;
    let ativo = true;
    carregarSelos([ong.id])
      .then((r) => {
        if (ativo) setSelos(r[ong.id]);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [ong]);

  // Perfil de transparência: só existe para ONG com organização aprovada (404 = validação não concluída).
  useEffect(() => {
    if (!ong) return;
    let ativo = true;
    setProfileState("loading");
    orgIdOfOwner(ong.id)
      .then(loadProfile)
      .then((p) => {
        if (ativo) {
          setProfile(p);
          setProfileState("ok");
        }
      })
      .catch((e) => {
        if (ativo)
          setProfileState(e?.response?.status === 404 ? "none" : "error");
      });
    return () => {
      ativo = false;
    };
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
      const { data } = await api.post<{ id: number }>(
        `/conversas/ongs/${ong.id}`,
      );
      navigate(`/conversas/${data.id}`);
    } catch {
      setErroConversa("Não foi possível iniciar a conversa. Tente novamente.");
    } finally {
      setAbrindoConversa(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-brand-muted text-center">
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
          className="bg-brand-primary hover:bg-brand-primaryDark px-5 py-2 rounded-lg font-medium text-brand-onPrimary"
        >
          Voltar para ONGs
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Voltar */}
      <button
        onClick={() => navigate("/ongs")}
        className="mb-6 font-medium text-brand-primaryText hover:text-brand-text"
      >
        ← Voltar para ONGs
      </button>

      {/* Cabeçalho: capa, foto, status da validação e nível de transparência */}
      <header className="relative bg-brand-surface shadow-sm mb-6 border border-brand-border rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-brand-champagne to-brand-primary/40 w-full h-36 sm:h-52">
          {ong.coverImage && (
            <img
              src={imagemUrl(ong.coverImage) ?? ""}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {user?.type === "DOADOR" && user.status === "ATIVO" && (
          <div className="top-4 right-4 z-10 absolute">
            <FavoritoButton ongId={ong.id} iconOnly />
          </div>
        )}

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex sm:flex-row flex-col items-start sm:items-end gap-4 -mt-12">
            <div className="flex justify-center items-center bg-brand-champagne shadow-sm border-4 border-brand-surface rounded-full w-24 h-24 overflow-hidden font-bold text-brand-primaryText text-3xl shrink-0">
              {ong.profileImage ? (
                <img
                  src={imagemUrl(ong.profileImage) ?? ong.profileImage}
                  alt={`Logo da ${ong.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                ong.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans text-brand-text text-3xl">
                  {ong.name}
                </h1>
              </div>
              {ong.category && (
                <p className="text-brand-goldText capitalize">{ong.category}</p>
              )}
              <p className="mt-1 text-brand-muted text-sm">
                CNPJ: {ong.cnpj ? fmtCnpj(ong.cnpj) : "Não informado"} · Na
                plataforma desde {fmtDay(ong.createdAt)}
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <CadastroVerificadoChip
                cadastro={selos?.cadastroVerificado}
                detalharRessalvas
              />
              {profile ? (
                <LevelBadge level={profile.transparencyLevel} compact />
              ) : (
                <NivelTransparenciaChip nivel={selos?.nivelTransparencia} />
              )}
            </div>
            <CadastroVerificadoPanel cadastro={selos?.cadastroVerificado}>
              {profile && <HistoricoValidacao profile={profile} />}
            </CadastroVerificadoPanel>
            {profileState === "loading" && (
              <p className="text-brand-muted text-sm" aria-live="polite">
                Carregando informações de transparência…
              </p>
            )}
            {profileState === "error" && (
              <p role="alert" className="text-red-600 text-sm">
                Não foi possível carregar as informações de transparência agora.
              </p>
            )}
            {(profileState === "ok" || profileState === "none") && (
              <ValidationStatus
                profile={profile}
                cadastro={selos?.cadastroVerificado}
              />
            )}
          </div>
        </div>
      </header>

      {user?.type === "DOADOR" && user.status === "ATIVO" && (
        <section className="flex flex-wrap items-center gap-3 bg-brand-surface shadow-sm mb-6 p-5 border border-brand-border rounded-2xl">
          <InteresseButton ongId={ong.id} />
          <button
            type="button"
            onClick={() => void iniciarConversa()}
            disabled={abrindoConversa}
            className="inline-flex justify-center items-center gap-2 hover:bg-brand-champagne disabled:opacity-60 px-5 py-3 border border-brand-primary rounded-xl font-semibold text-brand-primaryText transition"
          >
            <FaComments aria-hidden="true" />
            {abrindoConversa ? "Abrindo conversa..." : "Conversar com a ONG"}
          </button>
          {erroConversa && (
            <p role="alert" className="text-red-600 text-sm basis-full">
              {erroConversa}
            </p>
          )}
        </section>
      )}

      <div className="mb-6 overflow-x-auto">
        <div className="min-w-[36rem]">
          <Tabs
            ariaLabel="Seções do perfil da ONG"
            activeId={aba}
            onChange={(id) =>
              setParams(id === "sobre" ? {} : { aba: id }, { replace: true })
            }
            tabs={ABAS}
          />
        </div>
      </div>

      <div className="mb-10">
        <section
          id="tabpanel-sobre"
          role="tabpanel"
          aria-labelledby="tab-sobre"
          hidden={aba !== "sobre"}
          className="space-y-6"
        >
          {aba === "sobre" && (
            <>
              {/* Sobre */}
              <div className="bg-brand-surface shadow-sm mb-6 p-8 border border-brand-border rounded-2xl">
                <h2 className="mb-3 font-sans text-brand-text text-xl">
                  Sobre a ONG
                </h2>

                <p className="text-brand-muted leading-relaxed">
                  {ong.description ||
                    "Esta ONG ainda não possui uma descrição."}
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
              <div className="bg-brand-surface shadow-sm mb-6 p-8 border border-brand-border rounded-2xl">
                <h2 className="mb-6 font-sans text-brand-text text-xl">
                  Como você pode ajudar
                </h2>

                <div className="gap-4 grid md:grid-cols-2">
                  <div className="bg-brand-champagne p-5 border border-brand-border rounded-xl">
                    <h3 className="mb-2 font-bold text-brand-text">
                      💰 Doação financeira
                    </h3>

                    <p className="text-brand-muted text-sm leading-relaxed">
                      Contribua financeiramente para ajudar a ONG a manter seus
                      projetos e atividades.
                    </p>
                  </div>

                  <div className="bg-brand-champagne p-5 border border-brand-border rounded-xl">
                    <h3 className="mb-2 font-bold text-brand-text">
                      📦 Doação de materiais
                    </h3>

                    <p className="text-brand-muted text-sm leading-relaxed">
                      Doe materiais e itens que a ONG realmente precisa para
                      continuar seu trabalho.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contato e PIX */}
              <div className="gap-6 grid md:grid-cols-2 mb-6">
                <div className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl">
                  <h2 className="mb-5 font-sans text-brand-text text-xl">
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

                <div className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl">
                  <h2 className="mb-5 font-sans text-brand-text text-xl">
                    Chave PIX
                  </h2>

                  {ong.pixKey ? (
                    <>
                      <div className="bg-brand-champagne mb-4 p-4 rounded-lg font-mono text-brand-text text-sm break-all">
                        {ong.pixKey}
                      </div>

                      <button
                        onClick={handleCopyPix}
                        className="flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark px-4 py-3 rounded-lg w-full font-medium text-brand-onPrimary transition"
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
                  <h2 className="font-sans text-brand-text text-2xl">
                    Como você pode ajudar
                  </h2>

                  <p className="mt-1 text-brand-muted">
                    Veja as necessidades atuais desta ONG.
                  </p>
                </div>

                {loadingMetas ? (
                  <div className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl text-center">
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
        <section
          id="tabpanel-transparencia"
          role="tabpanel"
          aria-labelledby="tab-transparencia"
          hidden={aba !== "transparencia"}
          className="space-y-6"
        >
          {aba === "transparencia" && (
            <>
              {profile ? (
                <TransparenciaTab profile={profile} />
              ) : (
                <TabEmpty state={profileState} />
              )}
            </>
          )}
        </section>
        <section
          id="tabpanel-publicacoes"
          role="tabpanel"
          aria-labelledby="tab-publicacoes"
          hidden={aba !== "publicacoes"}
          className="space-y-6"
        >
          {aba === "publicacoes" && (
            <>
              <PublicacoesList ongId={ong.id} />
            </>
          )}
        </section>
        <section
          id="tabpanel-documentos"
          role="tabpanel"
          aria-labelledby="tab-documentos"
          hidden={aba !== "documentos"}
          className="space-y-6"
        >
          {aba === "documentos" && (
            <>
              {profile ? (
                <DocumentosTab profile={profile} />
              ) : (
                <TabEmpty state={profileState} />
              )}
            </>
          )}
        </section>
        <section
          id="tabpanel-historico"
          role="tabpanel"
          aria-labelledby="tab-historico"
          hidden={aba !== "historico"}
          className="space-y-6"
        >
          {aba === "historico" && (
            <>
              {profile ? (
                <TimelineTab timeline={profile.timeline} />
              ) : (
                <TabEmpty state={profileState} />
              )}
            </>
          )}
        </section>
        <section
          id="tabpanel-seguranca"
          role="tabpanel"
          aria-labelledby="tab-seguranca"
          hidden={aba !== "seguranca"}
          className="space-y-6"
        >
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
          className="text-brand-muted hover:text-red-600 text-sm underline"
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
