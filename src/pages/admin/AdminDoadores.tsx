import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

interface Donor {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  status: "ATIVO" | "SUSPENSO" | "BANIDO";
  contentRestricted: boolean;
}

export default function AdminDoadores() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Donor[]>("/admin/doadores")
      .then(({ data }) => setDonors(data))
      .catch(() => setError("Não foi possível carregar os doadores."));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return donors.filter((donor) =>
      `${donor.name} ${donor.email} ${donor.cpf ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [donors, search]);

  return (
    <div>
      <h1 className="mb-6 font-bold text-gray-900 text-2xl">Doadores cadastrados</h1>
      <div className="bg-white mb-6 p-4 border border-gray-200 rounded-xl">
        <label className="block text-sm">
          Buscar por nome, e-mail ou CPF
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-full max-w-md"
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-red-700">{error}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => (
                <tr key={donor.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{donor.name}</td>
                  <td className="px-4 py-3 text-gray-600">{donor.email}</td>
                  <td className="px-4 py-3 text-gray-600">{donor.cpf || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {donor.status === "ATIVO" && donor.contentRestricted
                      ? "Ativo com restrição"
                      : donor.status === "ATIVO" ? "Ativo" : donor.status === "SUSPENSO" ? "Suspenso" : "Banido"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/doadores/${donor.id}`)}
                      className="text-blue-700 hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-gray-400 text-center">Nenhum doador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
