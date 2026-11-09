import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { baixarDocumento, mensagemErro } from './api';
import type { DocumentoMedalha, ResumoMedalha, StatusMedalha } from './api';

const textos: Record<StatusMedalha, string> = {
  NaoSolicitado: 'Não solicitado',
  Pendente: 'Pendente (programa encerrado)',
  Aprovado: 'Aprovado',
  Recusado: 'Recusado',
};

const fmt = (d: string) => new Date(d).toLocaleString('pt-BR');

/**
 * Histórico do antigo fluxo de solicitações da Medalha Branca. Somente leitura: pedidos, análises e documentos
 * enviados continuam consultáveis. A medalha atual é concedida pela validação institucional. Com `ongId`, é a visão do admin.
 * Não aparece quando a instituição nunca participou do programa.
 */
export default function HistoricoMedalhaBranca({ ongId }: { ongId?: number }) {
  const admin = ongId !== undefined;
  const [dados, setDados] = useState<ResumoMedalha | null>(null);
  const [erro, setErro] = useState('');
  const [baixando, setBaixando] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    api
      .get<ResumoMedalha>(admin ? `/medalha-branca/admin/ongs/${ongId}` : '/medalha-branca/minha')
      .then(({ data }) => ativo && setDados(data))
      .catch((e) => ativo && setErro(mensagemErro(e)));
    return () => {
      ativo = false;
    };
  }, [admin, ongId]);

  async function baixar(documento: DocumentoMedalha) {
    setBaixando(documento.id);
    setErro('');
    try {
      await baixarDocumento(documento);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBaixando(null);
    }
  }

  const pedidos = dados?.solicitacoes ?? [];
  if (!pedidos.length && !erro) return null;

  return (
    <section
      aria-labelledby="historico-medalha-branca"
      className="rounded-2xl border border-brand-border bg-brand-surface p-5 text-brand-text shadow-sm"
    >
      <h2 id="historico-medalha-branca" className="text-lg font-semibold">
        Histórico da Medalha Branca
      </h2>
      <p className="mt-1 text-sm text-brand-muted">
        Os registros abaixo pertencem ao antigo fluxo de solicitações e são mantidos como histórico. Atualmente, a
        Medalha Branca é concedida após a conferência do CNPJ, a aprovação institucional e dos documentos obrigatórios.
      </p>
      {erro && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {erro}
        </p>
      )}
      {pedidos.length ? (
        <ul className="mt-4 space-y-3">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="rounded-lg border border-brand-border p-4">
              <p className="text-sm font-medium">
                Solicitação #{pedido.id}: {textos[pedido.status]}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Enviada em {fmt(pedido.createdAt)}</p>
              {pedido.analisadoEm && (
                <p className="mt-1 text-xs text-brand-muted">Analisada em {fmt(pedido.analisadoEm)}</p>
              )}
              {pedido.motivo && <p className="mt-2 text-sm">Observação: {pedido.motivo}</p>}
              {pedido.documentos.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {pedido.documentos.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        disabled={baixando !== null}
                        onClick={() => void baixar(doc)}
                        className="break-all text-left text-sm text-brand-primaryText underline disabled:opacity-50"
                      >
                        {baixando === doc.id ? 'Baixando…' : `Baixar ${doc.nome}`} ({(doc.tamanho / 1024 / 1024).toFixed(2)} MB)
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
