import { useForm } from "react-hook-form";

import { Button } from "../../../components/Button/index";
import { Input, Textarea } from "../../../components/Input/index";
import { Section } from "./Section";

import { useAuth } from "../../../context/useAuth";

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
    formState: { errors, isSubmitting },
  } = useForm<NgoFormValues>({ mode: "onBlur" });

  const { register: registerUser } = useAuth();

  const passwordValue = watch("password");

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
        title="Dados basicos"
        description="Informacoes essenciais sobre a ONG."
      >
        <Input
          label="Nome da ONG"
          name="ngoName"
          placeholder="Nome da organizacao"
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
          required
          error={errors.cnpj?.message}
          inputProps={register("cnpj", { required: "O CNPJ é obrigatório." })}
        />
        <div className="md:col-span-2">
          <Textarea
            label="Descricao"
            name="description"
            placeholder="Descreva a missao da ONG"
            required
            rows={4}
            error={errors.description?.message}
            textareaProps={register("description", {
              required: "A descrição é obrigatória.",
            })}
          />
        </div>
        <Input
          label="Area de atuacao"
          name="category"
          placeholder="Educacao, saude, animais"
          required
          error={errors.category?.message}
          inputProps={register("category", { required: "A área de atuação é obrigatória." })}
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
            minLength: { value: 6, message: "A senha deve ter pelo menos 6 caracteres." },
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

      <Section title="Endereco" description="Informe o endereco oficial.">
        <Input
          label="CEP"
          name="zip"
          placeholder="00000-000"
          required
          error={errors.zip?.message}
          inputProps={register("zip", { required: "O CEP é obrigatório." })}
        />
        <Input
          label="Rua e numero"
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
          placeholder="Sao Paulo"
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
        title="Dados bancarios"
        description="Informacoes para recebimento de doacoes."
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
          label="Agencia"
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
          placeholder="Corrente ou poupanca"
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
            placeholder="Email, telefone ou chave aleatoria"
            required
            error={errors.pixKey?.message}
            inputProps={register("pixKey", {
              required: "A chave PIX é obrigatória.",
            })}
          />
        </div>
      </Section>

      <Section
        title="Validacao legal"
        description="Dados do responsavel legal e documentos."
      >
        <Input
          label="Responsavel legal"
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
