import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { api, imagemUrl } from "../services/api";
import { useAuth } from "../context/useAuth";
import { NgoProfileForm } from "./Perfil/components/NgoProfileForm";
import { DonorProfileForm } from "./Perfil/components/DonorProfileForm";
import HistoricoMedalhaBranca from "../components/HistoricoMedalhaBranca";
import SelosDaInstituicao from "../components/selos/SelosDaInstituicao";
import CoverUpload from "../components/CoverUpload";

const TIPO_LABEL = {
  ONG: "ONG",
  DOADOR: "Doador",
} as const;

export default function Perfil() {
  const { user, updateUser } = useAuth();

  const [preview, setPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function abrirSeletor() {
    inputRef.current?.click();
  }

  function handleSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(jpe?g|png|webp)$/.test(file.type)) {
      setAviso({
        ok: false,
        texto: "Por favor, selecione uma imagem (JPG, PNG ou WEBP).",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAviso({ ok: false, texto: "A imagem deve ter no máximo 2MB." });
      return;
    }

    setAviso(null);
    if (preview) URL.revokeObjectURL(preview);
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
  }

  function cancelarSelecao() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function salvarFoto() {
    if (!arquivo || !user) return;

    const form = new FormData();
    form.append("file", arquivo); // mesmo nome do FileInterceptor('file')
    let fotoEnviada = false;

    try {
      setSalvando(true);

      // O axios define o Content-Type multipart sozinho. Não coloque manualmente.
      const { data } = await api.post<{ profileImage: string }>(
        "/users/me/avatar",
        form,
      );
      fotoEnviada = true;

      const fotoUrl = imagemUrl(data.profileImage);
      if (!fotoUrl) throw new Error("Endereço da foto não recebido");

      await new Promise<void>((resolve, reject) => {
        const imagem = new Image();
        imagem.onload = () => resolve();
        imagem.onerror = () => reject(new Error("Foto indisponível"));
        imagem.src = fotoUrl;
      });

      // Atualiza o contexto + localStorage: Perfil e Navbar mudam juntos
      updateUser({ profileImage: data.profileImage });
      cancelarSelecao();
      setAviso({ ok: true, texto: "Foto atualizada." });
    } catch (err) {
      console.error(err);
      setAviso({
        ok: false,
        texto: fotoEnviada
          ? "Sua foto foi enviada, mas ainda não pode ser exibida. A prévia foi mantida. Tente novamente em instantes."
          : "Erro ao salvar a foto. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  }

  if (!user) {
    return <p className="p-10 text-center">Faça login para ver seu perfil.</p>;
  }

  if (editing) {
    const profileParaEdicao = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      cpf: user.cpf ?? "",
      cnpj: user.cnpj ?? "",
      phone: user.phone ?? "",
      description: user.description ?? "",
      whatsapp: user.whatsapp ?? "",
      instagram: user.instagram ?? "",
      website: user.website ?? "",
      pixKey: user.pixKey ?? "",
      category: user.category ?? "",
    };

    return (
      <main className="bg-brand-background px-4 py-10 min-h-[calc(100vh-160px)]">
        <section className="bg-brand-surface shadow-sm p-8 border border-brand-text/10 rounded-2xl w-full">
          <h1 className="mb-6 font-sans text-brand-text text-3xl">
            Editar perfil
          </h1>

          {user.type === "ONG" ? (
            <NgoProfileForm
              profile={profileParaEdicao}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          ) : user.type === "DOADOR" ? (
            <DonorProfileForm
              profile={profileParaEdicao}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div>
              <p className="text-brand-text">
                A edição não está disponível para este tipo de conta.
              </p>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="mt-4 text-brand-primary underline"
              >
                Voltar ao perfil
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  const imagemExibida = preview ?? imagemUrl(user.profileImage);

  const tipoConta =
    user.type === "ONG" || user.type === "DOADOR"
      ? TIPO_LABEL[user.type]
      : user.type;

  return (
    <main className="bg-brand-background px-4 py-10 min-h-[calc(100vh-160px)]">
      <div className="flex flex-col gap-6 w-full">
        {/* Card do topo — foto + nome */}
        <section className="flex sm:flex-row flex-col items-center sm:items-start gap-6 bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl">
          {/* ===== FOTO ===== */}
          <div className="group relative">
            <div
              onClick={abrirSeletor}
              className="cursor-pointer"
              title="Clique para alterar a foto"
            >
              {imagemExibida ? (
                <img
                  src={imagemExibida}
                  alt={user.name}
                  className="shadow-md border-4 border-brand-surface rounded-full w-28 h-28 object-cover"
                />
              ) : (
                <div className="flex justify-center items-center bg-brand-champagne shadow-md border-4 border-brand-surface rounded-full w-28 h-28 font-bold text-brand-primaryText text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Overlay escuro com ícone — aparece no hover */}
              <div className="absolute inset-0 flex justify-center items-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                <FaCamera className="text-white text-2xl" />
              </div>
            </div>

            {/* Botão de câmera sempre visível no canto */}
            <button
              type="button"
              onClick={abrirSeletor}
              className="right-0 bottom-0 z-10 absolute flex justify-center items-center bg-brand-primary hover:bg-brand-primaryDark shadow-md border-2 border-brand-surface rounded-full w-9 h-9 text-brand-onPrimary transition-colors"
              title="Alterar foto"
            >
              <FaCamera className="text-sm" />
            </button>

            {/* Badge "preview" quando há arquivo não salvo */}
            {preview && (
              <span className="-top-2 left-1/2 z-10 absolute bg-brand-goldLight px-2 py-0.5 rounded-full font-semibold text-[10px] text-brand-primaryText uppercase -translate-x-1/2">
                Preview
              </span>
            )}
          </div>
          {/* ===== FIM FOTO ===== */}

          {/* Informações + botões */}
          <div className="flex-1 sm:text-left text-center">
            <h1 className="font-sans text-brand-text text-2xl">{user.name}</h1>
            <p className="text-brand-muted">{user.email}</p>

            <span className="inline-block bg-brand-champagne mt-3 px-3 py-1 rounded-full font-semibold text-brand-goldText text-xs">
              {tipoConta}
            </span>

            {aviso && (
              <p
                role={aviso.ok ? "status" : "alert"}
                className={`mt-3 text-sm ${aviso.ok ? "text-emerald-800" : "text-red-700"}`}
              >
                {aviso.texto}
              </p>
            )}

            {/* Botões de ação da foto */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              {!preview ? (
                <button
                  type="button"
                  onClick={abrirSeletor}
                  className="bg-brand-primary hover:bg-brand-primaryDark shadow-sm px-5 py-2 rounded-full font-semibold text-brand-onPrimary text-sm transition"
                >
                  Alterar foto
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={salvarFoto}
                    disabled={salvando}
                    className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 shadow-sm px-5 py-2 rounded-full font-semibold text-white text-sm transition"
                  >
                    {salvando ? "Salvando..." : "Salvar foto"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelarSelecao}
                    disabled={salvando}
                    className="hover:bg-brand-champagne px-5 py-2 border border-brand-border rounded-full font-semibold text-brand-primaryText text-sm transition"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Input de arquivo escondido */}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleSelecionarArquivo}
          />
        </section>

        {user.type === "ONG" && <CoverUpload ongId={user.id} />}

        {/* Card — Informações da conta */}
        <section className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans text-brand-text text-xl">
              Informações da conta
            </h2>
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={salvando}
              className="disabled:opacity-50 font-semibold text-brand-goldText text-sm hover:underline"
            >
              Editar
            </button>
          </div>

          <dl className="gap-x-8 gap-y-4 grid grid-cols-1 sm:grid-cols-2">
            <InfoItem label="Nome completo" value={user.name} />
            <InfoItem label="E-mail" value={user.email} />
            <InfoItem label="Telefone" value={user.phone ?? "—"} />
            <InfoItem label="Tipo de conta" value={tipoConta} />
            <InfoItem
              label="Membro desde"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                  : "Não informado"
              }
            />
          </dl>
        </section>

        <SelosDaInstituicao />
        {user?.type === "ONG" && <HistoricoMedalhaBranca />}

        {/* Card — Segurança */}
        <section className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl">
          <h2 className="mb-4 font-sans text-brand-text text-xl">Segurança</h2>
          <button className="hover:bg-brand-champagne px-5 py-2 border border-brand-border rounded-full font-semibold text-brand-primaryText text-sm transition">
            Alterar senha
          </button>
        </section>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-brand-muted text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="font-medium text-brand-text">{value}</dd>
    </div>
  );
}
