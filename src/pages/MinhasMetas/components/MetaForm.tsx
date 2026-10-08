import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/Button/index";
import { Input, Textarea } from "../../../components/Input/index";
import { Section } from "../../Auth/components/Section";

import { api } from "../../../services/api";

export interface Meta {
  id: number;
  title: string;
  description?: string;
  details?: string;
  type: "FINANCEIRA" | "MATERIAL" | "VOLUNTARIADO";
  priority: "BAIXA" | "MEDIA" | "ALTA";
  targetAmount?: number | string;
  currentAmount: number | string;
  targetQuantity?: number;
  currentQuantity: number;
  unit?: string;
  deadline?: string;
  active: boolean;
  ongId: number;
}

interface MetaFormValues {
  title: string;
  type: Meta["type"];
  priority: Meta["priority"];
  description: string;
  details: string;
  targetAmount: string;
  targetQuantity: string;
  unit: string;
  deadline: string;
}

interface MetaFormProps {
  meta?: Meta | null;
  onSaved: (meta: Meta) => void;
  onCancel: () => void;
}

export function MetaForm({ meta, onSaved, onCancel }: MetaFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MetaFormValues>({
    mode: "onBlur",
    defaultValues: {
      title: meta?.title ?? "",
      type: meta?.type ?? "FINANCEIRA",
      priority: meta?.priority ?? "MEDIA",
      description: meta?.description ?? "",
      details: meta?.details ?? "",
      targetAmount: meta?.targetAmount != null ? String(meta.targetAmount) : "",
      targetQuantity:
        meta?.targetQuantity != null ? String(meta.targetQuantity) : "",
      unit: meta?.unit ?? "",
      deadline: meta?.deadline ? meta.deadline.slice(0, 10) : "",
    },
  });

  const type = watch("type");

  const [submitError, setSubmitError] = useState("");

  async function onSubmit(data: MetaFormValues) {
    try {
      setSubmitError("");

      const payload = {
        title: data.title,
        type: data.type,
        priority: data.priority,
        description: data.description || undefined,
        details: data.details || undefined,
        targetAmount:
          data.type === "FINANCEIRA" && data.targetAmount
            ? Number(data.targetAmount)
            : undefined,
        targetQuantity:
          data.type !== "FINANCEIRA" && data.targetQuantity
            ? Number(data.targetQuantity)
            : undefined,
        unit: data.type !== "FINANCEIRA" ? data.unit || undefined : undefined,
        deadline: data.deadline || undefined,
      };

      const response = meta
        ? await api.patch(`/metas/${meta.id}`, payload)
        : await api.post("/metas", payload);

      onSaved(response.data);
    } catch (error: any) {
      console.error("Erro ao salvar meta:", error);
      setSubmitError(
        error?.response?.data?.message || "Não foi possível salvar a meta."
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
        title="Dados da meta"
        description="Informações principais sobre a meta ou campanha."
      >
        <Input
          label="Título"
          name="title"
          required
          error={errors.title?.message}
          inputProps={register("title", {
            required: "Este campo é obrigatório.",
          })}
        />

        <div className="space-y-2">
          <label htmlFor="type" className="font-medium text-brand-muted text-sm">
            Tipo <span className="text-amber-600">*</span>
          </label>
          <select
            id="type"
            className="bg-brand-surface shadow-sm px-4 py-3 border border-brand-text/15 focus-visible:border-brand-goldText rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30 w-full text-brand-text text-sm transition"
            {...register("type", { required: true })}
          >
            <option value="FINANCEIRA">Financeira</option>
            <option value="MATERIAL">Material</option>
            <option value="VOLUNTARIADO">Voluntariado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="font-medium text-brand-muted text-sm"
          >
            Prioridade
          </label>
          <select
            id="priority"
            className="bg-brand-surface shadow-sm px-4 py-3 border border-brand-text/15 focus-visible:border-brand-goldText rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30 w-full text-brand-text text-sm transition"
            {...register("priority")}
          >
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>

        <Input
          label="Prazo"
          name="deadline"
          type="text"
          placeholder="AAAA-MM-DD"
          inputProps={{ ...register("deadline"), type: "date" }}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Descrição curta"
            name="description"
            placeholder="Resumo exibido na listagem"
            rows={2}
            textareaProps={register("description")}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Descrição completa"
            name="details"
            placeholder="Detalhes exibidos na página da meta"
            rows={4}
            textareaProps={register("details")}
          />
        </div>
      </Section>

      <Section
        title="Objetivo"
        description="Defina a meta a ser alcançada de acordo com o tipo escolhido."
      >
        {type === "FINANCEIRA" ? (
          <Input
            label="Valor alvo (R$)"
            name="targetAmount"
            type="text"
            placeholder="0,00"
            inputProps={{
              ...register("targetAmount"),
              inputMode: "decimal",
            }}
          />
        ) : (
          <>
            <Input
              label="Quantidade alvo"
              name="targetQuantity"
              type="text"
              inputProps={{
                ...register("targetQuantity"),
                inputMode: "numeric",
              }}
            />
            <Input
              label="Unidade"
              name="unit"
              placeholder="cestas, horas, itens..."
              inputProps={register("unit")}
            />
          </>
        )}
      </Section>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {meta ? "Salvar alterações" : "Criar meta"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
