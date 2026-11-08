import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { errorMessage } from '../../services/organizations';

type Kind = 'publicacao' | 'campanha' | 'meta';
interface ReviewItem {
  id: string | number;
  title?: string;
  description?: string;
  category?: string;
  name?: string;
  createdAt?: string;
  ong?: { name?: string };
  organization?: { tradeName?: string | null; legalName?: string };
}

const config: Record<Kind, { label: string; list: string; review: (id: string | number) => string }> = {
  publicacao: { label: 'Publicações', list: '/admin/publications/pending', review: (id) => `/admin/publications/${id}/review` },
  campanha: { label: 'Campanhas', list: '/admin/campaigns/pending-review', review: (id) => `/admin/campaigns/${id}/review` },
  meta: { label: 'Metas', list: '/metas/admin/pending-review', review: (id) => `/metas/admin/${id}/review` },
};

function ReviewCard({ kind, item, onDone }: { kind: Kind; item: ReviewItem; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const organization = item.ong?.name ?? item.organization?.tradeName ?? item.organization?.legalName ?? 'ONG';
  const title = item.title ?? item.name ?? (kind === 'publicacao' ? `Publicação #${item.id}` : `${config[kind].label.slice(0, -1)} #${item.id}`);

  async function decide(decision: 'APROVAR' | 'REPROVAR') {
    setError('');
    if (decision === 'REPROVAR' && !reason.trim()) {
      setError('Informe o motivo para reprovar.');
      return;
    }
    setBusy(true);
    try {
      await api.post(config[kind].review(item.id), { decision, ...(reason.trim() ? { reason: reason.trim() } : {}) });
      onDone();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">ONG: {organization}{item.category ? ` · ${item.category}` : ''}</p>
        </div>
        {item.createdAt && <time className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('pt-BR')}</time>}
      </div>
      {item.description && <p className="whitespace-pre-wrap text-sm text-slate-700">{item.description}</p>}
      <label className="block text-sm text-slate-700">
        Motivo da reprovação
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={1000} className="mt-1 w-full rounded-lg border border-slate-300 p-2" placeholder="Obrigatório somente ao reprovar" />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => void decide('APROVAR')} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Aprovar</button>
        <button disabled={busy} onClick={() => void decide('REPROVAR')} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Reprovar</button>
      </div>
    </article>
  );
}

export default function AdminConteudos() {
  const [kind, setKind] = useState<Kind>('publicacao');
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems((await api.get<ReviewItem[]>(config[kind].list)).data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Análise de conteúdo</h1>
        <p className="mt-1 text-sm text-slate-600">Conteúdos de ONGs com CNPJ conferido aguardam aprovação. A Medalha Branca permite publicação imediata.</p>
      </header>
      <nav className="flex flex-wrap gap-2" aria-label="Tipo de conteúdo">
        {(Object.keys(config) as Kind[]).map((key) => (
          <button key={key} onClick={() => setKind(key)} aria-pressed={kind === key} className={`rounded-full border px-4 py-2 text-sm ${kind === key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
            {config[key].label}
          </button>
        ))}
      </nav>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? <p className="py-8 text-center text-slate-500">Carregando itens pendentes…</p> : items.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Não há itens aguardando análise.</p> : (
        <div className="space-y-3">
          {items.map((item) => <ReviewCard key={`${kind}-${item.id}`} kind={kind} item={item} onDone={() => void load()} />)}
        </div>
      )}
    </section>
  );
}
