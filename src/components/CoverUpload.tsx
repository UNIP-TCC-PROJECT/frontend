import { useEffect, useRef, useState } from "react";
import { api, imagemUrl } from "../services/api";
import { Button } from "./Button";

/** Imagem de capa do perfil público da ONG. */
export default function CoverUpload({ ongId }: { ongId: number }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ coverImage?: string | null }>(`/users/ongs/${ongId}`).then((r) => setCurrent(r.data.coverImage ?? null)).catch(() => undefined);
  }, [ongId]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setMsg(null);
    if (f && f.size > 3 * 1024 * 1024) { setMsg({ ok: false, text: "A capa deve ter no máximo 3 MB." }); e.target.value = ""; return; }
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setSaving(true);
      const { data } = await api.post<{ coverImage: string }>("/users/me/cover", fd);
      setCurrent(data.coverImage); setFile(null); setPreview(null);
      if (input.current) input.current.value = "";
      setMsg({ ok: true, text: "Capa atualizada." });
    } catch {
      setMsg({ ok: false, text: "Não foi possível salvar a capa. Use JPG, PNG ou WebP de até 3 MB." });
    } finally {
      setSaving(false);
    }
  }

  const shown = preview ?? imagemUrl(current);
  return (
    <section className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-xs">
      <h2 className="text-xl font-sans text-brand-text">Capa do perfil público</h2>
      <p className="mt-1 text-sm text-brand-muted">Aparece no topo da página da sua instituição. Evite imagens com rostos de crianças ou pessoas vulneráveis.</p>
      <div className="mt-4 h-32 overflow-hidden rounded-xl bg-gradient-to-r from-brand-champagne to-brand-primary/40 sm:h-40">
        {shown && <img src={shown} alt="Prévia da capa do perfil" className="h-full w-full object-cover" />}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="cover-input" className="sr-only">Escolher imagem de capa</label>
        <input ref={input} id="cover-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="text-sm text-brand-muted file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-brand-border file:bg-brand-surface file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-primaryText hover:file:bg-brand-champagne" />
        {file && <Button onClick={() => void save()} isLoading={saving}>Salvar capa</Button>}
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>{msg.text}</p>}
    </section>
  );
}
