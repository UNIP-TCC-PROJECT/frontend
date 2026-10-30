import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { errorMessage } from "../../services/organizations";

// Enrolamento obrigatório de MFA (TOTP) para administradores.
export default function AdminMfa() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState("");
  const [erro, setErro] = useState("");

  async function iniciar() {
    setErro("");
    try { setSetup((await api.post("/auth/mfa/setup")).data); } catch (e) { setErro(errorMessage(e)); }
  }
  async function ativar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    try { await api.post("/auth/mfa/enable", { code }); navigate("/admin"); } catch (err) { setErro(errorMessage(err)); }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-xl font-semibold">Ativar verificação em duas etapas</h1>
      <p className="text-sm text-gray-600">Administradores precisam de um aplicativo autenticador (Google Authenticator, Authy, 1Password…) para acessar o painel.</p>
      {!setup ? (
        <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => void iniciar()}>Gerar chave</button>
      ) : (
        <form onSubmit={ativar} className="space-y-3">
          <p className="text-sm">No aplicativo, adicione uma conta manualmente com a chave:</p>
          <code className="block break-all rounded bg-gray-100 p-3 text-sm">{setup.secret}</code>
          <p className="text-xs text-gray-500 break-all">Ou use o link: {setup.otpauth_url}</p>
          <input className="w-full rounded border px-3 py-2" inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="rounded bg-slate-900 px-4 py-2 text-white" disabled={code.length !== 6}>Ativar</button>
        </form>
      )}
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
    </div>
  );
}
