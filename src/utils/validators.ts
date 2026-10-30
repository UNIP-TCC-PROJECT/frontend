/** CPF com 11 dígitos e dígitos verificadores válidos (aceita máscara; rejeita 111.111.111-11). */
export function isValidCpf(raw: string): boolean {
  const c = raw.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Number(c[i]) * (n + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}

// Aceita com ou sem http(s)://; exige domínio. Bloqueia javascript:, data:, ftp: etc.
const SITE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

export const isValidWebsite = (v: string) => v.trim().length <= 200 && SITE.test(v.trim());

/** Sem protocolo, assume https://. */
export function normalizeWebsite(v?: string): string | undefined {
  const t = v?.trim();
  if (!t) return undefined;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
