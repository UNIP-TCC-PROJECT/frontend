import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { api } from "../services/api";
const categories = [
  { label: "Animais", value: "animais" },
  { label: "Crianças", value: "criancas" },
  { label: "Alimentos", value: "alimentos" },
  { label: "Roupas", value: "roupas" },
];

export default function Ongs() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOngs() {
      try {
        const response = await api.get("/users/ongs");

        setOngs(response.data);
      } catch (error) {
        console.error("Erro ao buscar ONGs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOngs();
  }, []);

  const filteredOngs = ongs.filter((ong: any) => {
    const matchName = ong?.name?.toLowerCase()?.includes(search.toLowerCase());

    const matchCategory = category ? ong?.category === category : true;

    return matchName && matchCategory;
  });

  return (
    <>
      {/* Título */}
      <h1 className="mb-2 font-extrabold text-gray-900 text-3xl md:text-4xl">
        ONGs disponíveis
      </h1>

      <p className="mb-8 text-gray-600">
        Encontre instituições confiáveis para apoiar
      </p>

      {/* Filtros */}
      <div className="flex md:flex-row flex-col md:items-center gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ONG..."
          className="bg-white shadow-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-full md:w-72"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-5 py-2 rounded-full border text-sm font-medium shadow-sm transition ${
                category === cat.value
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {category && (
            <button
              onClick={() => setCategory("")}
              className="bg-gray-100 ml-2 px-4 py-2 border border-gray-300 rounded-full text-gray-500 text-xs"
            >
              Limpar filtro
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-10 text-gray-500 text-center">
          Carregando ONGs...
        </div>
      )}

      {/* Lista de ONGs */}
      {!loading && (
        <div className="gap-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOngs.length === 0 && (
            <div className="col-span-full py-12 text-gray-400 text-center">
              Nenhuma ONG encontrada.
            </div>
          )}

          {filteredOngs.map((ong: any) => (
            <div
              key={ong.id}
              className="flex flex-col bg-white shadow p-6 border border-gray-100 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{ong.name}</h3>

                <span className="flex items-center gap-1 ml-2 font-semibold text-green-600 text-xs">
                  <FaCheckCircle />
                  Perfil completo
                </span>
              </div>

              {ong?.city && (
                <span className="mb-1 text-blue-700 text-sm">{ong.city}</span>
              )}

              <p className="mb-2 text-gray-600 text-sm line-clamp-2">
                {ong.description || "Sem descrição disponível."}
              </p>

              <button
                onClick={() => navigate(`/ongs/${ong.id}`)}
                className="bg-blue-700 hover:bg-blue-800 shadow mt-auto px-4 py-2 rounded font-medium text-white text-center transition"
              >
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
