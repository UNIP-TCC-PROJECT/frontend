import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../../services/api";

/** Campo de senha com botão para mostrar/ocultar (mesmo comportamento do login), no estilo do admin. */
function PasswordField({
  id,
  value,
  onChange,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 pr-10 border rounded w-full text-sm"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={show}
        className="top-1/2 right-2 absolute p-1 text-gray-500 hover:text-gray-900 -translate-y-1/2"
      >
        {show ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
      </button>
    </div>
  );
}

export default function AdminCreateAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/admins", { name, email, password });

      setSuccess(`Administrador "${name}" criado com sucesso.`);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar administrador.");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded border p-2 text-sm";
  const label = "mb-1 block text-sm text-gray-500";

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-blue-700 text-sm underline">
        ← Voltar
      </Link>
      <header>
        <h1 className="font-semibold text-xl">Novo administrador</h1>
        <p className="mt-1 text-gray-500 text-xs">
          Apenas administradores já autenticados podem criar novos acessos
          administrativos.
        </p>
      </header>

      {error && (
        <p role="alert" className="text-red-700 text-sm">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-green-800 text-sm">
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 border rounded-lg"
      >
        <h2 className="font-semibold">Dados de acesso</h2>
        <div className="gap-x-6 gap-y-4 grid md:grid-cols-2 text-sm">
          <div>
            <label htmlFor="adm-nome" className={label}>
              Nome
            </label>
            <input
              id="adm-nome"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="adm-email" className={label}>
              E-mail
            </label>
            <input
              id="adm-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="adm-senha" className={label}>
              Senha
            </label>
            <PasswordField
              id="adm-senha"
              value={password}
              onChange={setPassword}
              minLength={8}
            />
            <p className="mt-1 text-gray-500 text-xs">
              Mínimo de 8 caracteres.
            </p>
          </div>
          <div>
            <label htmlFor="adm-confirma" className={label}>
              Confirmar senha
            </label>
            <PasswordField
              id="adm-confirma"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded font-medium text-white text-sm"
        >
          {loading ? "Criando..." : "Criar administrador"}
        </button>
      </form>
    </div>
  );
}
