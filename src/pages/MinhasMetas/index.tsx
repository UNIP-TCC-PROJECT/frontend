import { useEffect, useState } from "react";

import { Card } from "../../components/Card/index";
import { Button } from "../../components/Button/index";
import { MetaForm, type Meta } from "./components/MetaForm";

import { api } from "../../services/api";

function getProgress(meta: Meta) {
  if (meta.type === "FINANCEIRA") {
    const target = Number(meta.targetAmount ?? 0);
    const current = Number(meta.currentAmount ?? 0);

    if (target <= 0) return 0;

    return Math.min((current / target) * 100, 100);
  }

  const target = Number(meta.targetQuantity ?? 0);
  const current = Number(meta.currentQuantity ?? 0);

  if (target <= 0) return 0;

  return Math.min((current / target) * 100, 100);
}

function getTypeLabel(type: Meta["type"]) {
  if (type === "FINANCEIRA") return "Financeira";
  if (type === "MATERIAL") return "Material";
  return "Voluntariado";
}

export default function MinhasMetas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  async function fetchMetas() {
    try {
      setError("");
      const response = await api.get("/metas/mine");
      setMetas(response.data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      setError("Não foi possível carregar suas metas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetas();
  }, []);

  function handleSaved(meta: Meta) {
    setMetas((prev) => {
      const exists = prev.some((item) => item.id === meta.id);
      return exists
        ? prev.map((item) => (item.id === meta.id ? meta : item))
        : [meta, ...prev];
    });
    setFormOpen(false);
    setEditingMeta(null);
  }

  function handleEdit(meta: Meta) {
    setEditingMeta(meta);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingMeta(null);
    setFormOpen(true);
  }

  async function handleDeactivate(meta: Meta) {
    if (!confirm(`Deseja realmente desativar a meta "${meta.title}"?`)) {
      return;
    }

    try {
      setDeactivatingId(meta.id);
      const response = await api.delete(`/metas/${meta.id}`);

      setMetas((prev) =>
        prev.map((item) => (item.id === meta.id ? response.data : item))
      );
    } catch (error) {
      console.error("Erro ao desativar meta:", error);
      alert("Não foi possível desativar a meta.");
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-sans text-brand-text text-3xl">
            Minhas metas
          </h1>
          <p className="mt-1 text-brand-muted">
            Gerencie as metas e campanhas da sua ONG.
          </p>
        </div>

        {!formOpen && <Button onClick={handleNew}>Nova meta</Button>}
      </div>

      {formOpen && (
        <Card className="mb-6">
          <h2 className="mb-4 font-sans text-brand-text text-xl">
            {editingMeta ? "Editar meta" : "Nova meta"}
          </h2>
          <MetaForm
            meta={editingMeta}
            onSaved={handleSaved}
            onCancel={() => {
              setFormOpen(false);
              setEditingMeta(null);
            }}
          />
        </Card>
      )}

      {loading ? (
        <div className="py-10 text-brand-muted text-center">
          Carregando suas metas...
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : metas.length === 0 ? (
        <div className="bg-brand-surface shadow-sm p-8 border border-brand-border rounded-2xl text-center">
          <p className="text-brand-muted">
            Você ainda não cadastrou nenhuma meta.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {metas.map((meta) => {
            const progress = getProgress(meta);

            return (
              <div
                key={meta.id}
                className={`rounded-2xl border bg-brand-surface p-6 shadow-sm ${
                  meta.active ? "border-brand-border" : "border-brand-border opacity-60"
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-brand-text text-lg">
                        {meta.title}
                      </h3>
                      <span className="bg-brand-champagne px-2 py-0.5 rounded-full font-semibold text-brand-goldText text-xs">
                        {getTypeLabel(meta.type)}
                      </span>
                      {!meta.active && (
                        <span className="bg-brand-text/10 px-2 py-0.5 rounded-full font-semibold text-brand-muted text-xs">
                          Inativa
                        </span>
                      )}
                    </div>
                    {meta.description && (
                      <p className="text-brand-muted text-sm">
                        {meta.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => handleEdit(meta)}>
                      Editar
                    </Button>
                    {meta.active && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeactivate(meta)}
                        isLoading={deactivatingId === meta.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Desativar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-champagne">
                  <div
                    className="bg-brand-gold rounded-full h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 font-semibold text-brand-primaryText text-xs">
                  {Math.round(progress)}% alcançado
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
