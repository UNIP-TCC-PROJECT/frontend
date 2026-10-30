import { useState, type FocusEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/Button/index";
import { Input, Select, Textarea } from "../../../components/Input/index";
import { Section } from "./Section";

import { useAuth } from "../../../context/useAuth";
import { CATEGORIES } from "../../../constants/categories";

interface NgoFormValues {
  ngoName: string;
  cnpj: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  website: string;
  zip: string;
  street: string;
  city: string;
  state: string;
  bank: string;
  agency: string;
  account: string;
  accountType: string;
  pixKey: string;
  legalName: string;
  legalCpf: string;
  password: string;
  confirmPassword: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NgoRegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<NgoFormValues>({ mode: "onBlur" });

  const { register: registerUser } = useAuth();

  const passwordValue = watch("password");

  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");

  const zipField = register("zip", { required: "O CEP é obrigatório." });

  async function handleZipBlur(event: FocusEvent<HTMLInputElement>) {
    await zipField.onBlur(event);

    const cep = event.target.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      return;
    }

    try {
      setCepStatus("loading");

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepStatus("error");
        return;
      }

      setValue("street", `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}`, {
        shouldValidate: true,
      });
      setValue("city", data.localidade, { shouldValidate: true });
      setValue("state", data.uf, { shouldValidate: true });
      clearErrors(["street", "city", "state"]);
      setCepStatus("idle");
    } catch {
      setCepStatus("error");
    }
  }

  async function onSubmit(data: NgoFormValues) {
    try {
      await registerUser({
        name: data.ngoName,
        email: data.email,
        password: data.password,
        type: "ONG",
        cnpj: data.cnpj,
        phone: data.phone,
        description: data.description,
        category: data.category,
        website: data.website,
        zip: data.zip,
        street: data.street,
        city: data.city,
        state: data.state,
        bank: data.bank,
        agency: data.agency,
        account: data.account,
        accountType: data.accountType,
        pixKey: data.pixKey,
        legalName: data.legalName,
        legalCpf: data.legalCpf,
      });
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(" ")
        : apiMessage || "Não foi possível concluir o cadastro. Tente novamente.";

      setError("root.server", { message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section
        title="Dados básicos"
        description="Informações essenciais sobre a ONG."
      >
        <Input
          label="Nome da ONG"
          name="ngoName"
          placeholder="Nome da organização"
          required
          error={errors.ngoName?.message}
          inputProps={register("ngoName", {
            required: "O nome da ONG é obrigatório.",
          })}
        />
        <Input
          label="CNPJ"
          name="cnpj"
          placeholder="00.000.000/0001-00"
          mask="99.999.999/9999-99"
          required
          error={errors.cnpj?.message}
          inputProps={register("cnpj", { required: "O CNPJ é obrigatório." })}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Descrição"
            name="description"
            placeholder="Descreva a missão da ONG"
            required
            rows={4}
            error={errors.description?.message}
            textareaProps={register("description", {
              required: "A descrição é obrigatória.",
            })}
          />
        </div>
        <Select
          label="Área de atuação"
          name="category"
          placeholder="Selecione uma área"
          options={CATEGORIES}
          required
          error={errors.category?.message}
          selectProps={register("category", {
            required: "A área de atuação é obrigatória.",
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
          error={errors.password?.message}
          inputProps={register("password", {
            required: "A senha é obrigatória.",
            minLength: { value: 8, message: "A senha deve ter pelo menos 8 caracteres." },
          })}
        />
        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="Repita a senha"
          required
          error={errors.confirmPassword?.message}
          inputProps={register("confirmPassword", {
            required: "A confirmação de senha é obrigatória.",
            validate: (value) =>
              value === passwordValue || "As senhas não conferem.",
          })}
        />
      </Section>

      <Section title="Contato" description="Como podemos entrar em contato?">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="contato@ong.org"
          required
          autoComplete="email"
          error={errors.email?.message}
          inputProps={register("email", {
            required: "O e-mail é obrigatório.",
            pattern: {
              value: emailRegex,
              message: "Informe um e-mail válido.",
            },
          })}
        />
        <Input
          label="Telefone"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          mask="(99) 99999-9999"
          required
          autoComplete="tel"
          error={errors.phone?.message}
          inputProps={register("phone", {
            required: "O telefone é obrigatório.",
          })}
        />
        <Input
          label="Site"
          name="website"
          type="url"
          placeholder="https://"
          inputProps={register("website")}
        />
      </Section>

      <Section title="Endereço" description="Informe o endereço oficial.">
        <div>
          <Input
            label="CEP"
            name="zip"
            placeholder="00000-000"
            mask="99999-999"
            required
            error={errors.zip?.message}
            inputProps={{
              ...zipField,
              onBlur: handleZipBlur,
            }}
          />
          {cepStatus === "loading" ? (
            <p className="mt-1 text-brand-muted text-xs">Buscando endereço...</p>
          ) : null}
          {cepStatus === "error" ? (
            <p className="mt-1 text-amber-600 text-xs">
              CEP não encontrado. Preencha o endereço manualmente.
            </p>
          ) : null}
        </div>
        <Input
          label="Rua e número"
          name="street"
          placeholder="Rua, 123"
          required
          error={errors.street?.message}
          inputProps={register("street", {
            required: "O endereço é obrigatório.",
          })}
        />
        <Input
          label="Cidade"
          name="city"
          placeholder="São Paulo"
          required
          error={errors.city?.message}
          inputProps={register("city", { required: "A cidade é obrigatória." })}
        />
        <Input
          label="Estado"
          name="state"
          placeholder="SP"
          required
          error={errors.state?.message}
          inputProps={register("state", {
            required: "O estado é obrigatório.",
          })}
        />
      </Section>

      <Section
        title="Dados bancários"
        description="Informações para recebimento de doações."
      >
        <Input
          label="Banco"
          name="bank"
          placeholder="Nome do banco"
          required
          error={errors.bank?.message}
          inputProps={register("bank", { required: "O banco é obrigatório." })}
        />
        <Input
          label="Agência"
          name="agency"
          placeholder="0001"
          required
          error={errors.agency?.message}
          inputProps={register("agency", {
            required: "A agência é obrigatória.",
          })}
        />
        <Input
          label="Conta"
          name="account"
          placeholder="12345-6"
          required
          error={errors.account?.message}
          inputProps={register("account", {
            required: "A conta é obrigatória.",
          })}
        />
        <Input
          label="Tipo de conta"
          name="accountType"
          placeholder="Corrente ou poupança"
          required
          error={errors.accountType?.message}
          inputProps={register("accountType", {
            required: "O tipo de conta é obrigatório.",
          })}
        />
        <div className="md:col-span-2">
          <Input
            label="Chave PIX"
            name="pixKey"
            placeholder="Email, telefone ou chave aleatória"
            required
            error={errors.pixKey?.message}
            inputProps={register("pixKey", {
              required: "A chave PIX é obrigatória.",
            })}
          />
        </div>
      </Section>

      <Section
        title="Validação legal"
        description="Dados do responsável legal e documentos."
      >
        <Input
          label="Responsável legal"
          name="legalName"
          placeholder="Nome completo"
          required
          error={errors.legalName?.message}
          inputProps={register("legalName", {
            required: "O responsável legal é obrigatório.",
          })}
        />
        <Input
          label="CPF"
          name="legalCpf"
          placeholder="000.000.000-00"
          mask="999.999.999-99"
          required
          error={errors.legalCpf?.message}
          inputProps={register("legalCpf", {
            required: "O CPF é obrigatório.",
          })}
        />
      </Section>

      {errors.root?.server?.message && (
        <p role="alert" className="text-red-700 text-sm">
          {errors.root.server.message}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
