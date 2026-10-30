import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "../services/api";

const MIN_PASSWORD_LENGTH = 8;

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }

    if (error.response.status === 429) {
      return "Muitas tentativas. Aguarde um minuto e tente novamente.";
    }

    // O backend já responde em português (link inválido, expirado, já usado...).
    const message = error.response.data?.message;

    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }

  return "Não foi possível redefinir a senha. Tente novamente.";
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Link sem token (por exemplo, o endereço foi copiado incompleto).
  if (!token) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold text-gray-900">Link inválido</h1>
        <p className="mt-4 text-sm text-gray-600">
          Este link de recuperação está incompleto ou é inválido. Solicite um
          novo link.
        </p>
        <Link
          to="/esqueci-senha"
          className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Solicitar novo link
        </Link>
      </Container>
    );
  }

  if (done) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold text-gray-900">Senha alterada</h1>
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800"
        >
          Sua senha foi redefinida com sucesso. Use a nova senha para entrar.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
          Ir para o login
        </Link>
      </Container>
    );
  }

  const inputType = showPasswords ? "text" : "password";

  return (
    <Container>
      <h1 className="text-2xl font-semibold text-gray-900">
        Criar nova senha
      </h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Nova senha
          </label>
          <input
            id="password"
            type={inputType}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo de {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            type={inputType}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(event) => setShowPasswords(event.target.checked)}
          />
          Mostrar senhas
        </label>

        {error && (
          <div role="alert" className="text-sm text-red-600">
            <p>{error}</p>
            <Link
              to="/esqueci-senha"
              className="mt-1 inline-block font-medium text-blue-600 hover:underline"
            >
              Solicitar novo link
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || password === "" || confirmPassword === ""}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </Container>
  );
}

function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
