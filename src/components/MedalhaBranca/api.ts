import { isAxiosError } from 'axios';
import { api } from '../../services/api';

export type StatusMedalha =
  | 'NaoSolicitado'
  | 'Pendente'
  | 'Aprovado'
  | 'Recusado';
export interface DocumentoMedalha {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
}
export interface PedidoMedalha {
  id: number;
  status: StatusMedalha;
  createdAt: string;
  analisadoEm: string | null;
  motivo: string | null;
  documentos: DocumentoMedalha[];
}
export interface ResumoMedalha {
  status: StatusMedalha;
  solicitacoes: PedidoMedalha[];
}

export function mensagemErro(error: unknown) {
  if (isAxiosError(error)) {
    const mensagem: unknown = error.response?.data?.message;
    if (typeof mensagem === 'string') return mensagem;
    if (Array.isArray(mensagem)) return mensagem.join(' ');
    if (error.response?.status === 413)
      return 'Cada documento deve ter no máximo 5 MB.';
    if (error.response?.status === 401)
      return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export async function baixarDocumento(documento: DocumentoMedalha) {
  const { data } = await api.get<Blob>(
    `/medalha-branca/documentos/${documento.id}`,
    {
      responseType: 'blob',
    },
  );
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = documento.nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
