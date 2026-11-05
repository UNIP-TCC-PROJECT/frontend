import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { Section } from "./Section";
import { useAuth } from "../../../context/useAuth";
import { cpfValido } from "../../../utils/cpf";

interface DonorFormValues {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const phoneRegex = /^\(?[1-9]\d\)?\s?\d{4,5}-?\d{4}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

const passwordMessage =
  "A senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.";
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
        cpf: data.cpf,
        phone: data.phone,
      });

      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);

      const apiMessage = error?.response?.data?.message;
      setSubmitError(
        Array.isArray(apiMessage)
          ? apiMessage.join(" ")
          : apiMessage ||
              "Não foi possível concluir o cadastro. Tente novamente.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError ? (
        <p
          role="alert"
          className="bg-amber-50 p-3 rounded-lg text-amber-700 text-sm"
        >
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
          required
          error={errors.cpf?.message}
          inputProps={register("cpf", {
            required: "O CPF é obrigatório.",
            validate: (value) => cpfValido(value) || "Informe um CPF válido.",
          })}
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
          placeholder="DDD + número, fixo ou celular"
          error={errors.phone?.message}
          inputProps={register("phone", {
            validate: (value) =>
              !value?.trim() ||
              phoneRegex.test(value) ||
              "Informe um telefone válido com DDD.",
          })}
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
            pattern: {
              value: passwordRegex,
              message: passwordMessage,
            },
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
