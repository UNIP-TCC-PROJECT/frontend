import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "../services/api";

// A mensagem é sempre a mesma: a tela não revela se o e-mail tem cadastro.
const SUCCESS_MESSAGE =
  "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. " +
  "Confira também a caixa de spam.";

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }

    if (error.response.status === 429) {
      return "Muitas tentativas. Aguarde um minuto e tente novamente.";
    }

    if (error.response.status === 400) {
      return "Informe um e-mail válido.";
    }
  }

  return "Não foi possível enviar a solicitação. Tente novamente.";
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Esqueci minha senha
        </h1>

        {sent ? (
          <div className="mt-4 space-y-6">
            <p
              role="status"
              className="rounded-md bg-green-50 p-3 text-sm text-green-800"
            >
              {SUCCESS_MESSAGE}
            </p>

            <Link
              to="/auth"
              className="inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <p className="text-sm text-gray-600">
              Informe o e-mail da sua conta. Se ele estiver cadastrado, você
              receberá um link para criar uma nova senha.
            </p>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || email.trim() === ""}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
