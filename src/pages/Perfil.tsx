import { useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';

export default function Perfil() {
  const [user, setUser] = useState({
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    tipo: 'Doador',
    avatarUrl: null as string | null,
    criadoEm: '10/01/2026',
  });

  // Preview local da nova imagem (antes de salvar)
  const [preview, setPreview] = useState<string | null>(null);

  // Referência para o input escondido
  const inputRef = useRef<HTMLInputElement>(null);

  function abrirSeletor() {
    inputRef.current?.click();
  }

  function handleSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem (JPG, PNG ou WEBP).');
      return;
    }

    // Validação de tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    // Cria preview local
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function cancelarSelecao() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function salvarFoto() {
    // 👇 Por enquanto, só atualiza o user localmente.
    // Depois vamos trocar por uma chamada à API.
    if (!preview) return;

    setUser((prev) => ({ ...prev, avatarUrl: preview }));
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // A imagem exibida é o preview (se tiver) ou a atual
  const imagemExibida = preview ?? user.avatarUrl;

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Card do topo — foto + nome */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* ===== FOTO ===== */}
          <div className="relative group">
            <div
              onClick={abrirSeletor}
              className="cursor-pointer"
              title="Clique para alterar a foto"
            >
              {imagemExibida ? (
                <img
                  src={imagemExibida}
                  alt={user.nome}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Overlay escuro com ícone — aparece no hover */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white text-2xl" />
              </div>
            </div>

            {/* Botão de câmera sempre visível no canto */}
            <button
              type="button"
              onClick={abrirSeletor}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-blue-700 transition-colors z-10"
              title="Alterar foto"
            >
              <FaCamera className="text-sm" />
            </button>

            {/* Badge "preview" quando há arquivo não salvo */}
            {preview && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase z-10">
                Preview
              </span>
            )}
          </div>
          {/* ===== FIM FOTO ===== */}

          {/* Informações + botões */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-800">{user.nome}</h1>
            <p className="text-slate-500">{user.email}</p>

            <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {user.tipo}
            </span>

            {/* Botões de ação da foto */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
              {!preview ? (
                <button
                  type="button"
                  onClick={abrirSeletor}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Alterar foto
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={salvarFoto}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Salvar foto
                  </button>
                  <button
                    type="button"
                    onClick={cancelarSelecao}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
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

        {/* Card — Informações da conta */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Informações da conta
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Editar
            </button>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <InfoItem label="Nome completo" value={user.nome} />
            <InfoItem label="E-mail" value={user.email} />
            <InfoItem label="Telefone" value={user.telefone} />
            <InfoItem label="Tipo de conta" value={user.tipo} />
            <InfoItem label="Membro desde" value={user.criadoEm} />
          </dl>
        </section>

        {/* Card — Segurança */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Segurança</h2>
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
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
      <dt className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {label}
      </dt>
      <dd className="text-slate-800 font-medium">{value}</dd>
    </div>
  );
}