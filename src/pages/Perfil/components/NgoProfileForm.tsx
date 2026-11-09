import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/Button/index";
import { Input, Select, Textarea } from "../../../components/Input/index";
import { Section } from "../../Auth/components/Section";

import { api } from "../../../services/api";
import { useAuth } from "../../../context/useAuth";
import { CATEGORIES } from "../../../constants/categories";

interface NgoProfile {
  id: number;
  name: string;
  email: string;
  type: string;
  cnpj?: string;
  phone?: string;
  description?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  pixKey?: string;
  category?: string;
  [key: string]: any;
}

interface NgoProfileFormValues {
  name: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  pixKey: string;
}

interface NgoProfileFormProps {
  profile: NgoProfile;
  onSaved: (profile: NgoProfile) => void;
  onCancel: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NgoProfileForm({ profile, onSaved, onCancel }: NgoProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NgoProfileFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: profile.name ?? "",
      description: profile.description ?? "",
      category: profile.category ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      whatsapp: profile.whatsapp ?? "",
      instagram: profile.instagram ?? "",
      website: profile.website ?? "",
      pixKey: profile.pixKey ?? "",
    },
  });

  const { updateUser } = useAuth();

  const [submitError, setSubmitError] = useState("");

  async function onSubmit(data: NgoProfileFormValues) {
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
      <Section
        title="Dados básicos"
        description="Informações essenciais sobre a ONG."
      >
        <Input
          label="Nome da ONG"
          name="name"
          required
          error={errors.name?.message}
          inputProps={register("name", {
            required: "Este campo é obrigatório.",
          })}
        />
        <Input
          label="CNPJ"
          name="cnpj"
          value={profile.cnpj ?? ""}
          placeholder="00.000.000/0001-00"
          inputProps={{ readOnly: true, "aria-describedby": "cnpj-help" }}
        />
        <p id="cnpj-help" className="-mt-1 text-xs text-brand-muted">
          O CNPJ está vinculado à conferência cadastral e não pode ser alterado por esta tela.
        </p>
        <div className="md:col-span-2">
          <Textarea
            label="Descrição"
            name="description"
            placeholder="Descreva a missão da ONG"
            rows={4}
            textareaProps={register("description")}
          />
        </div>
        <Select
          label="Área de atuação"
          name="category"
          placeholder="Selecione uma área"
          options={CATEGORIES}
          selectProps={register("category")}
        />
      </Section>

      <Section title="Contato" description="Como podemos entrar em contato?">
        <Input
          label="Email"
          name="email"
          type="email"
          required
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
        <Input
          label="WhatsApp"
          name="whatsapp"
          placeholder="(11) 99999-9999"
          mask="(99) 99999-9999"
          inputProps={register("whatsapp")}
        />
        <Input
          label="Instagram"
          name="instagram"
          placeholder="@minhaong"
          inputProps={register("instagram")}
        />
        <Input
          label="Site"
          name="website"
          type="url"
          placeholder="https://"
          inputProps={register("website")}
        />
      </Section>

      <Section
        title="Dados bancários"
        description="Informações para recebimento de doações."
      >
        <div className="md:col-span-2">
          <Input
            label="Chave PIX"
            name="pixKey"
            placeholder="Email, telefone ou chave aleatória"
            inputProps={register("pixKey")}
          />
        </div>
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
