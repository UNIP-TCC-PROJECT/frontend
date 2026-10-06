import { useEffect, useState } from "react";

import { Card } from "../../components/Card/index";
import { Button } from "../../components/Button/index";
import { NgoProfileForm } from "./components/NgoProfileForm";
import { DonorProfileForm } from "./components/DonorProfileForm";

import { api } from "../../services/api";

interface Profile {
  id: number;
  name: string;
  email: string;
  type: string;
  cpf?: string;
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

export default function Perfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/users/me");

        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setError("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleSaved(updated: Profile) {
    setProfile(updated);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="py-10 text-brand-text/60 text-center">
        Carregando perfil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">{error || "Perfil não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-serif text-brand-text text-3xl">
        Meu perfil
      </h1>

      <Card>
        {editing ? (
          profile.type === "ONG" ? (
            <NgoProfileForm
              profile={profile}
              onSaved={handleSaved}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <DonorProfileForm
              profile={profile}
              onSaved={handleSaved}
              onCancel={() => setEditing(false)}
            />
          )
        ) : (
          <div className="space-y-6">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-brand-sage rounded-full w-16 h-16 font-bold text-brand-primary text-2xl shrink-0">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-brand-text text-xl">
                    {profile.name}
                  </h2>
                  <span className="text-brand-text/60 text-sm">
                    {profile.type === "ONG" ? "ONG" : "Doador"}
                  </span>
                </div>
              </div>
              <Button onClick={() => setEditing(true)}>Editar perfil</Button>
            </div>

            <dl className="gap-x-6 gap-y-4 grid sm:grid-cols-2">
              <div>
                <dt className="text-brand-text/60 text-xs">Email</dt>
                <dd className="text-brand-text text-sm">{profile.email}</dd>
              </div>
              {profile.phone && (
                <div>
                  <dt className="text-brand-text/60 text-xs">Telefone</dt>
                  <dd className="text-brand-text text-sm">{profile.phone}</dd>
                </div>
              )}
              {profile.type === "DOADOR" && profile.cpf && (
                <div>
                  <dt className="text-brand-text/60 text-xs">CPF</dt>
                  <dd className="text-brand-text text-sm">{profile.cpf}</dd>
                </div>
              )}
              {profile.type === "ONG" && (
                <>
                  <div>
                    <dt className="text-brand-text/60 text-xs">CNPJ</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.cnpj || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-text/60 text-xs">Área de atuação</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.category || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-text/60 text-xs">WhatsApp</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.whatsapp || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-text/60 text-xs">Instagram</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.instagram || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-text/60 text-xs">Site</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.website || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-text/60 text-xs">Chave PIX</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.pixKey || "Não informado"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-brand-text/60 text-xs">Descrição</dt>
                    <dd className="text-brand-text text-sm">
                      {profile.description || "Não informado"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        )}
      </Card>
    </div>
  );
}
