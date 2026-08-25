import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/Button/index";
import { Input } from "../../../components/Input/index";
import { Section } from "../../Auth/components/Section";

import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface DonorProfile {
  id: number;
  name: string;
  email: string;
  type: string;
  cpf?: string;
  phone?: string;
  [key: string]: any;
}

interface DonorProfileFormValues {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface DonorProfileFormProps {
  profile: DonorProfile;
  onSaved: (profile: DonorProfile) => void;
  onCancel: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DonorProfileForm({ profile, onSaved, onCancel }: DonorProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorProfileFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: profile.name ?? "",
      cpf: profile.cpf ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
  });

  const { updateUser } = useAuth();

  const [submitError, setSubmitError] = useState("");

  async function onSubmit(data: DonorProfileFormValues) {
    try {
      setSubmitError("");

      const response = await api.patch("/users/me", data);

      updateUser(response.data);
      onSaved(response.data);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      setSubmitError(
        error?.response?.data?.message || "Não foi possível salvar as alterações."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError ? (
        <p className="bg-amber-50 p-3 rounded-lg text-amber-700 text-sm">
          {submitError}
        </p>
      ) : null}
      <Section title="Dados basicos" description="Suas informações de cadastro.">
        <Input
          label="Nome completo"
          name="name"
          required
          autoComplete="name"
          error={errors.name?.message}
          inputProps={register("name", {
            required: "Este campo é obrigatório.",
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
          inputProps={register("phone")}
        />
      </Section>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Salvar alterações
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
