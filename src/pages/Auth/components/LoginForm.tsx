import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { useAuth } from "../../../context/AuthContext";

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

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Erro no login:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="font-semibold text-slate-900 text-2xl">Entrar</h2>
        <p className="text-slate-500 text-sm">
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
            required: "Email is required.",
            pattern: {
              value: emailRegex,
              message: "Enter a valid email address.",
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
            required: "Password is required.",
          })}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
        <button
          type="button"
          className="text-brand-primary hover:text-blue-700 transition"
        >
          Esqueci minha senha
        </button>
      </div>

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
