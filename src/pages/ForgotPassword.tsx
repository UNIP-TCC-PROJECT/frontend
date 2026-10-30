import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { Card } from "../components/Card/index";
import { Input } from "../components/Input/index";
import { Button } from "../components/Button/index";
import { api } from "../services/api";

// A mensagem é sempre a mesma: a tela não revela se o e-mail tem cadastro.
const SUCCESS_MESSAGE =
  "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. " +
  "Confira também a caixa de spam.";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (!emailRegex.test(email.trim())) {
      setFieldError("Informe um email válido.");
      return;
    }

    setFieldError("");
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
    <div className="flex flex-col mx-auto w-full max-w-4xl text-brand-text">
      <Card className="mt-8">
        <div className="fade-in">
          {sent ? (
            <div className="space-y-6">
              <header className="space-y-2 text-center">
                <h2 className="font-sans text-brand-text text-2xl">
                  Verifique seu e-mail
                </h2>
                <p className="text-brand-muted text-sm">
                  Enviamos as instruções de recuperação.
                </p>
              </header>

              <p
                role="status"
                className="bg-emerald-50 p-4 rounded-xl text-emerald-800 text-sm"
              >
                {SUCCESS_MESSAGE}
              </p>

              <Button
                type="button"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <header className="space-y-2 text-center">
                <h2 className="font-sans text-brand-text text-2xl">
                  Esqueci minha senha
                </h2>
                <p className="text-brand-muted text-sm">
                  Informe o e-mail da sua conta e enviaremos um link para criar
                  uma nova senha.
                </p>
              </header>

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="voce@email.com"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={fieldError}
                inputProps={{ autoFocus: true }}
              />

              {error ? (
                <p role="alert" className="text-amber-600 text-sm">
                  {error}
                </p>
              ) : null}

              <Button type="submit" isLoading={loading} className="w-full">
                Enviar link de recuperação
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Voltar para o login
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
