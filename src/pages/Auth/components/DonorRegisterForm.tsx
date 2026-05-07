import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { Section } from "./Section";
import { useAuth } from "../../../context/AuthContext";

interface DonorFormValues {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DonorRegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormValues>({ mode: "onBlur" });

  const { register: registerUser, login } = useAuth();

  const passwordValue = watch("password");

  async function onSubmit(data: DonorFormValues) {
    try {
      await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        type: "DOADOR",
        cpf: data.cpf,
        phone: data.phone,
      });

      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="Dados basicos" description="Informacoes para o cadastro.">
        <Input
          label="Nome completo"
          name="fullName"
          placeholder="Seu nome"
          required
          autoComplete="name"
          error={errors.fullName?.message}
          inputProps={register("fullName", {
            required: "This field is required.",
          })}
        />
        <Input
          label="CPF"
          name="cpf"
          placeholder="000.000.000-00"
          inputProps={register("cpf")}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          required
          autoComplete="email"
          error={errors.email?.message}
          inputProps={register("email", {
            required: "This field is required.",
            pattern: {
              value: emailRegex,
              message: "Enter a valid email address.",
            },
          })}
        />
        <Input
          label="Telefone"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          inputProps={register("phone")}
        />
      </Section>

      <Section title="Seguranca" description="Crie sua senha de acesso.">
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Crie uma senha"
          required
          autoComplete="new-password"
          error={errors.password?.message}
          inputProps={register("password", {
            required: "This field is required.",
          })}
        />
        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="Repita a senha"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          inputProps={register("confirmPassword", {
            required: "This field is required.",
            validate: (value) =>
              value === passwordValue || "Passwords do not match.",
          })}
        />
      </Section>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
