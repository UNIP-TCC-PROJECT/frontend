import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { errorMessage } from "../../services/organizations";

// Enrolamento obrigatório de MFA (TOTP) para administradores.
export default function AdminMfa() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<{
    secret: string;
    otpauth_url: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [erro, setErro] = useState("");

  async function iniciar() {
    setErro("");
    try {
      setSetup((await api.post("/auth/mfa/setup")).data);
    } catch (e) {
      setErro(errorMessage(e));
    }
  }
  async function ativar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      await api.post("/auth/mfa/enable", { code });
      navigate("/admin");
    } catch (err) {
      setErro(errorMessage(err));
    }
  }

  return (
    <div className="space-y-4 mx-auto p-8 max-w-md">
      <h1 className="font-semibold text-xl">
        Ativar verificação em duas etapas
      </h1>
      <p className="text-gray-600 text-sm">
        Administradores precisam de um aplicativo autenticador (Google
        Authenticator, Authy, 1Password…) para acessar o painel.
      </p>
      {!setup ? (
        <button
          className="bg-slate-900 px-4 py-2 rounded text-white"
          onClick={() => void iniciar()}
        >
          Gerar chave
        </button>
      ) : (
        <form onSubmit={ativar} className="space-y-3">
          <p className="text-sm">
            No aplicativo, adicione uma conta manualmente com a chave:
          </p>
          <code className="block bg-gray-100 p-3 rounded text-sm break-all">
            {setup.secret}
          </code>
          <p className="text-gray-500 text-xs break-all">
            Ou use o link: {setup.otpauth_url}
          </p>
          <input
            className="px-3 py-2 border rounded w-full"
            inputMode="numeric"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="bg-slate-900 px-4 py-2 rounded text-white"
            disabled={code.length !== 6}
          >
            Ativar
          </button>
        </form>
      )}
      {erro && (
        <p role="alert" className="text-red-700 text-sm">
          {erro}
        </p>
      )}
    </div>
  );
}
