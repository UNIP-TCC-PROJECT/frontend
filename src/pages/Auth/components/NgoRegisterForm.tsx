import { useForm } from "react-hook-form";
import { Button } from "../../../components/Button/index";
import { Input, Textarea } from "../../../components/Input/index";
import { Section } from "./Section";

interface NgoFormValues {
  ngoName: string;
  cnpj: string;
  description: string;
  area: string;
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
  document?: FileList;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NgoRegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NgoFormValues>({ mode: "onBlur" });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 900));
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
            required: "This field is required.",
          })}
        />
        <Input
          label="CNPJ"
          name="cnpj"
          placeholder="00.000.000/0001-00"
          required
          error={errors.cnpj?.message}
          inputProps={register("cnpj", { required: "This field is required." })}
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
              required: "This field is required.",
            })}
          />
        </div>
        <Input
          label="Area de atuacao"
          name="area"
          placeholder="Educacao, saude, animais"
          required
          error={errors.area?.message}
          inputProps={register("area", { required: "This field is required." })}
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
          required
          autoComplete="tel"
          error={errors.phone?.message}
          inputProps={register("phone", {
            required: "This field is required.",
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
          inputProps={register("zip", { required: "This field is required." })}
        />
        <Input
          label="Rua e numero"
          name="street"
          placeholder="Rua, 123"
          required
          error={errors.street?.message}
          inputProps={register("street", {
            required: "This field is required.",
          })}
        />
        <Input
          label="Cidade"
          name="city"
          placeholder="Sao Paulo"
          required
          error={errors.city?.message}
          inputProps={register("city", { required: "This field is required." })}
        />
        <Input
          label="Estado"
          name="state"
          placeholder="SP"
          required
          error={errors.state?.message}
          inputProps={register("state", {
            required: "This field is required.",
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
          inputProps={register("bank", { required: "This field is required." })}
        />
        <Input
          label="Agencia"
          name="agency"
          placeholder="0001"
          required
          error={errors.agency?.message}
          inputProps={register("agency", {
            required: "This field is required.",
          })}
        />
        <Input
          label="Conta"
          name="account"
          placeholder="12345-6"
          required
          error={errors.account?.message}
          inputProps={register("account", {
            required: "This field is required.",
          })}
        />
        <Input
          label="Tipo de conta"
          name="accountType"
          placeholder="Corrente ou poupanca"
          required
          error={errors.accountType?.message}
          inputProps={register("accountType", {
            required: "This field is required.",
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
              required: "This field is required.",
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
            required: "This field is required.",
          })}
        />
        <Input
          label="CPF"
          name="legalCpf"
          placeholder="000.000.000-00"
          required
          error={errors.legalCpf?.message}
          inputProps={register("legalCpf", {
            required: "This field is required.",
          })}
        />
        <div className="md:col-span-2">
          <div className="space-y-2">
            <label
              htmlFor="document"
              className="font-medium text-slate-700 text-sm"
            >
              Documento (opcional)
            </label>
            <input
              id="document"
              type="file"
              className="bg-white px-4 py-3 border border-slate-300 border-dashed rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 w-full text-slate-700 text-sm transition"
              {...register("document")}
            />
            <p className="text-slate-500 text-xs">
              Envie um comprovante da ONG.
            </p>
          </div>
        </div>
      </Section>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
