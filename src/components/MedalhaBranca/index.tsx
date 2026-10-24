import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { baixarDocumento, mensagemErro } from './api';
import type { DocumentoMedalha, ResumoMedalha, StatusMedalha } from './api';

const textos: Record<StatusMedalha, string> = {
  NaoSolicitado: 'Não solicitado',
  Pendente: 'Pendente de análise',
  Aprovado: 'Aprovado',
  Recusado: 'Recusado',
};
const cores: Record<StatusMedalha, string> = {
  NaoSolicitado: 'bg-gray-100 text-gray-700',
  Pendente: 'bg-amber-100 text-amber-900',
  Aprovado: 'bg-green-100 text-green-800',
  Recusado: 'bg-red-100 text-red-800',
};
const botao =
  'rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50 disabled:cursor-not-allowed';

export default function SolicitarMedalhaBranca() {
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);
  if (user?.type !== 'ONG') return null;

  return (
    <section className="mb-8">
      <button
        type="button"
        className={botao}
        aria-expanded={aberto}
        aria-controls="solicitacao-medalha-branca"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? 'Fechar Medalha Branca' : 'Solicitar Medalha Branca'}
      </button>
      {aberto && (
        <div id="solicitacao-medalha-branca" className="mt-4">
          {user.status === 'ATIVO' ? (
            <Painel key={user.id} />
          ) : (
            <p role="status">
              Somente ONGs com cadastro ativo podem solicitar a medalha.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function AnaliseMedalhaBranca({ ongId }: { ongId: number }) {
  return (
    <div className="mt-6">
      <Painel key={ongId} ongId={ongId} />
    </div>
  );
}

function Painel({ ongId }: { ongId?: number }) {
  const admin = ongId !== undefined;
  const endpoint = admin
    ? `/medalha-branca/admin/ongs/${ongId}`
    : '/medalha-branca/minha';
  const [dados, setDados] = useState<ResumoMedalha | null>(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [motivo, setMotivo] = useState('');
  const [baixando, setBaixando] = useState<string | null>(null);
  const ocupado = useRef(false);
  const versao = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    if (ocupado.current) return;
    const atual = ++versao.current;
    setCarregando(true);
    try {
      const { data } = await api.get<ResumoMedalha>(endpoint);
      if (atual === versao.current) {
        setDados(data);
        setErro('');
      }
    } catch (error) {
      if (atual === versao.current) setErro(mensagemErro(error));
    } finally {
      if (atual === versao.current) setCarregando(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void carregar();
    const atualizar = () => {
      if (!document.hidden) void carregar();
    };
    const timer = window.setInterval(atualizar, 30000);
    window.addEventListener('focus', atualizar);
    return () => {
      ++versao.current;
      window.clearInterval(timer);
      window.removeEventListener('focus', atualizar);
    };
  }, [carregar]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ocupado.current) return;
    if (
      !arquivos.length ||
      arquivos.length > 5 ||
      arquivos.some(
        (f) =>
          !['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) ||
          !f.size ||
          f.size > 5 * 1024 * 1024,
      )
    ) {
      setErro(
        'Selecione de 1 a 5 documentos PDF, JPG ou PNG de até 5 MB cada.',
      );
      return;
    }
    ocupado.current = true;
    ++versao.current;
    setEnviando(true);
    setCarregando(false);
    setErro('');
    setAviso('');
    const form = new FormData();
    arquivos.forEach((file) => form.append('documentos', file));
    try {
      const { data } = await api.post<ResumoMedalha>(
        '/medalha-branca/minha',
        form,
      );
      setDados(data);
      setArquivos([]);
      if (input.current) input.current.value = '';
      setAviso('Documentos enviados. Sua solicitação está aguardando análise.');
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }

  async function analisar(status: 'Aprovado' | 'Recusado') {
    const pedido = dados?.solicitacoes[0];
    if (!pedido || ocupado.current) return;
    if (status === 'Recusado' && !motivo.trim()) {
      setErro('Informe o motivo da recusa para orientar a ONG.');
      return;
    }
    ocupado.current = true;
    ++versao.current;
    setEnviando(true);
    setCarregando(false);
    setErro('');
    setAviso('');
    try {
      const { data } = await api.patch<ResumoMedalha>(
        `/medalha-branca/admin/${pedido.id}`,
        { status, motivo: motivo.trim() },
      );
      setDados(data);
      setMotivo('');
      setAviso('Análise salva. A ONG já pode consultar o resultado.');
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }

  async function baixar(documento: DocumentoMedalha) {
    setBaixando(documento.id);
    setErro('');
    try {
      await baixarDocumento(documento);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setBaixando(null);
    }
  }

  return (
    <section
      aria-label="Medalha Branca"
      className="rounded-xl border border-brand-border bg-brand-surface p-5 text-brand-text"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {admin ? 'Análise da Medalha Branca' : 'Minha Medalha Branca'}
        </h2>
        <button
          type="button"
          onClick={() => void carregar()}
          disabled={carregando || enviando}
          className="text-sm underline disabled:opacity-50"
        >
          {carregando ? 'Atualizando…' : 'Atualizar status'}
        </button>
      </div>
      {erro && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
          {erro}
        </p>
      )}
      {aviso && (
        <p role="status" className="mb-4 text-green-800">
          {aviso}
        </p>
      )}
      {!dados && carregando && <p>Carregando solicitação…</p>}
      {dados && (
        <>
          <div role="status" aria-live="polite" className="mb-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${cores[dados.status]}`}
            >
              {textos[dados.status]}
            </span>
            {dados.status === 'Pendente' && (
              <p className="mt-3 text-sm">
                Os documentos estão em análise. Aguarde o resultado antes de
                fazer uma nova solicitação.
              </p>
            )}
            {dados.status === 'Aprovado' && (
              <p className="mt-3 text-sm">
                {admin
                  ? 'A ONG recebeu a Medalha Branca.'
                  : 'Sua solicitação foi aprovada! Sua ONG recebeu a Medalha Branca.'}
              </p>
            )}
            {dados.status === 'Recusado' && (
              <p className="mt-3 text-sm">
                Solicitação recusada. {dados.solicitacoes[0]?.motivo}{' '}
                {!admin &&
                  'Confira o motivo e envie os documentos corrigidos para uma nova análise.'}
              </p>
            )}
          </div>
          {!admin && ['NaoSolicitado', 'Recusado'].includes(dados.status) && (
            <form onSubmit={enviar} className="mb-5 space-y-3">
              <label htmlFor="documentos-medalha" className="block font-medium">
                Documentos da ONG
              </label>
              <p
                id="documentos-medalha-ajuda"
                className="text-sm text-brand-muted"
              >
                Envie de 1 a 5 documentos para verificação. Formatos PDF, JPG ou
                PNG, até 5 MB por arquivo. Eles ficam disponíveis apenas para
                sua ONG e a administração.
              </p>
              <input
                ref={input}
                id="documentos-medalha"
                type="file"
                multiple
                required
                accept=".pdf,.jpg,.jpeg,.png"
                aria-describedby="documentos-medalha-ajuda"
                disabled={enviando}
                onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
                className="block w-full text-sm"
              />
              {arquivos.length > 0 && (
                <ul className="list-inside list-disc text-sm">
                  {arquivos.map((file, i) => (
                    <li key={i}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="submit"
                disabled={enviando || !arquivos.length}
                className={botao}
              >
                {enviando
                  ? 'Enviando documentos…'
                  : dados.status === 'Recusado'
                    ? 'Enviar nova solicitação'
                    : 'Enviar solicitação'}
              </button>
            </form>
          )}
          {dados.solicitacoes.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                Solicitações e documentos enviados
              </h3>
              {dados.solicitacoes.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-lg border border-brand-border p-4"
                >
                  <p className="text-sm font-medium">
                    Solicitação #{pedido.id} — {textos[pedido.status]}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    Enviada em{' '}
                    {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                  </p>
                  {pedido.analisadoEm && (
                    <p className="mt-1 text-xs text-brand-muted">
                      Analisada em{' '}
                      {new Date(pedido.analisadoEm).toLocaleString('pt-BR')}
                    </p>
                  )}
                  {pedido.motivo && (
                    <p className="mt-2 text-sm">Observação: {pedido.motivo}</p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {pedido.documentos.map((doc) => (
                      <li key={doc.id}>
                        <button
                          type="button"
                          disabled={baixando !== null}
                          onClick={() => void baixar(doc)}
                          className="break-all text-left text-sm text-brand-primaryText underline disabled:opacity-50"
                        >
                          {baixando === doc.id
                            ? 'Baixando…'
                            : `Baixar ${doc.nome}`}{' '}
                          ({(doc.tamanho / 1024 / 1024).toFixed(2)} MB)
                        </button>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
          {admin && dados.status === 'Pendente' && (
            <div className="mt-5 space-y-3">
              <label
                htmlFor="motivo-medalha"
                className="block text-sm font-medium"
              >
                Observação da análise (obrigatória para recusar)
              </label>
              <textarea
                id="motivo-medalha"
                value={motivo}
                maxLength={2000}
                disabled={enviando}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-brand-border p-3"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={enviando}
                  className={botao}
                  onClick={() => void analisar('Aprovado')}
                >
                  Aprovar solicitação
                </button>
                <button
                  type="button"
                  disabled={enviando}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-800 disabled:opacity-50"
                  onClick={() => void analisar('Recusado')}
                >
                  Recusar solicitação
                </button>
              </div>
              {enviando && <p role="status">Salvando análise…</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}
