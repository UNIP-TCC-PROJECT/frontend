import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

import { Card } from "../components/Card/index";
import { Input } from "../components/Input/index";
import { Button } from "../components/Button/index";
import { api } from "../services/api";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // limite do bcrypt, igual ao do backend

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const matches = confirmPassword !== "" && password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (!longEnough) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(`A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`);
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
      <Shell
        title="Link inválido"
        subtitle="Este link de recuperação está incompleto ou é inválido."
      >
        <Button
          type="button"
          className="w-full"
          onClick={() => navigate("/esqueci-senha")}
        >
          Solicitar novo link
        </Button>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell title="Senha alterada" subtitle="Tudo certo com a sua conta.">
        <p
          role="status"
          className="bg-emerald-50 p-4 rounded-xl text-emerald-800 text-sm"
        >
          Sua senha foi redefinida com sucesso. Use a nova senha para entrar.
        </p>
        <Button type="button" className="w-full" onClick={() => navigate("/auth")}>
          Ir para o login
        </Button>
      </Shell>
    );
  }

  return (
    <Shell
      title="Criar nova senha"
      subtitle="Escolha uma senha forte que você não use em outros sites."
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <Input
          label="Nova senha"
          name="password"
          type="password"
          placeholder="Sua nova senha"
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          inputProps={{ autoFocus: true, maxLength: MAX_PASSWORD_LENGTH }}
        />
        <Input
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          placeholder="Repita a nova senha"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          inputProps={{ maxLength: MAX_PASSWORD_LENGTH }}
        />
      </div>

      <ul className="space-y-1.5 text-sm" aria-label="Requisitos da senha">
        <Requirement ok={longEnough}>
          Pelo menos {MIN_PASSWORD_LENGTH} caracteres
        </Requirement>
        <Requirement ok={matches}>As duas senhas são iguais</Requirement>
        <li className="pl-6 text-brand-muted text-xs">
          Evite senhas comuns ou repetitivas (como 12345678).
        </li>
      </ul>

      {error ? (
        <div role="alert" className="space-y-1 text-amber-600 text-sm">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => navigate("/esqueci-senha")}
            className="font-medium text-brand-primaryText hover:text-brand-text underline transition"
          >
            Solicitar novo link
          </button>
        </div>
      ) : null}

      <Button
        type="submit"
        isLoading={loading}
        disabled={password === "" || confirmPassword === ""}
        className="w-full"
      >
        Redefinir senha
      </Button>
    </Shell>
  );
}

function Requirement({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        ok ? "text-emerald-700" : "text-brand-muted"
      }`}
    >
      {ok ? (
        <FaCheckCircle aria-hidden className="w-4 h-4" />
      ) : (
        <FaRegCircle aria-hidden className="w-4 h-4" />
      )}
      <span>{children}</span>
      <span className="sr-only">{ok ? "(atendido)" : "(pendente)"}</span>
    </li>
  );
}

// Mesmo cartão e cabeçalho da tela de login.
function Shell({
  title,
  subtitle,
  onSubmit,
  children,
}: {
  title: string;
  subtitle: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  const header = (
    <header className="space-y-2 text-center">
      <h2 className="font-sans text-brand-text text-2xl">{title}</h2>
      <p className="text-brand-muted text-sm">{subtitle}</p>
    </header>
  );

  return (
    <div className="flex flex-col mx-auto w-full max-w-4xl text-brand-text">
      <Card className="mt-8">
        <div className="fade-in">
          {onSubmit ? (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              {header}
              {children}
            </form>
          ) : (
            <div className="space-y-6">
              {header}
              {children}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
