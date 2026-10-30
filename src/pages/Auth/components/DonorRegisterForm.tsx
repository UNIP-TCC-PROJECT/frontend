import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { Section } from "./Section";
import { isValidCpf } from "../../../utils/validators";
import { useAuth } from "../../../context/useAuth";

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

  const [submitError, setSubmitError] = useState("");

  async function onSubmit(data: DonorFormValues) {
    try {
      setSubmitError("");

      await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        type: "DOADOR",
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : undefined,
        phone: data.phone,
      });

      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);

      const apiMessage = error?.response?.data?.message;
      setSubmitError(
        Array.isArray(apiMessage)
          ? apiMessage.join(" ")
          : apiMessage || "Não foi possível concluir o cadastro. Tente novamente."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError ? (
        <p role="alert" className="bg-amber-50 p-3 rounded-lg text-amber-700 text-sm">
          {submitError}
        </p>
      ) : null}

      <Section title="Dados básicos" description="Informações para o cadastro.">
        <Input
          label="Nome completo"
          name="fullName"
          placeholder="Seu nome"
          required
          autoComplete="name"
          error={errors.fullName?.message}
          inputProps={register("fullName", {
            required: "Este campo é obrigatório.",
          })}
        />
        <Input
          label="CPF"
          name="cpf"
          placeholder="000.000.000-00"
          mask="999.999.999-99"
          error={errors.cpf?.message}
          inputProps={{
            ...register("cpf", {
              validate: (v) => !v || isValidCpf(v) || "CPF inválido.",
            }),
            inputMode: "numeric",
            maxLength: 14,
          }}
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
            required: "Este campo é obrigatório.",
            pattern: {
              value: emailRegex,
              message: "Informe um email válido.",
            },
          })}
        />
        <Input
          label="Telefone"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          mask="(99) 99999-9999"
          inputProps={register("phone")}
        />
      </Section>

      <Section title="Segurança" description="Crie sua senha de acesso.">
        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Crie uma senha"
          required
          autoComplete="new-password"
          error={errors.password?.message}
          inputProps={register("password", {
            required: "Este campo é obrigatório.",
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
            required: "Este campo é obrigatório.",
            validate: (value) =>
              value === passwordValue || "As senhas não conferem.",
          })}
        />
      </Section>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
