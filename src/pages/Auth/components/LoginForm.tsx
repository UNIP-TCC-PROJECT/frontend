import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { useAuth } from "../../../context/useAuth";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onCreateAccount: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onCreateAccount }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

  const { login } = useAuth();

  const [formError, setFormError] = useState("");

  async function onSubmit(data: LoginFormValues) {
    try {
      setFormError("");
      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Erro no login:", error);
      setFormError(
        error?.response?.data?.message ??
          "Não foi possível fazer login. Verifique seus dados e tente novamente."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="font-serif text-brand-text text-2xl">Entrar</h2>
        <p className="text-brand-text/60 text-sm">
          Acesse sua conta para acompanhar o impacto.
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          required
          autoComplete="email"
          error={errors.email?.message}
          inputProps={register("email", {
            required: "O email é obrigatório.",
            pattern: {
              value: emailRegex,
              message: "Informe um email válido.",
            },
          })}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Sua senha"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          inputProps={register("password", {
            required: "A senha é obrigatória.",
          })}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
        <button
          type="button"
          className="text-brand-primary hover:text-brand-primaryDark transition"
        >
          Esqueci minha senha
        </button>
      </div>

      {formError ? (
        <p role="alert" className="text-amber-600 text-sm">
          {formError}
        </p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Entrar
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onCreateAccount}
      >
        Criar conta
      </Button>
    </form>
  );
}
