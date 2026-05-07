import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const categories = [
  { label: "Animais", value: "animais" },
  { label: "Crianças", value: "criancas" },
  { label: "Alimentos", value: "alimentos" },
  { label: "Roupas", value: "roupas" },
];

const featuredOngs = [
  {
    id: 1,
    name: "Amigos dos Animais",
    city: "São Paulo",
    description: "Protegendo e cuidando de animais em situação de rua.",
  },
  {
    id: 2,
    name: "Criança Feliz",
    city: "Rio de Janeiro",
    description: "Apoiando crianças em situação de vulnerabilidade.",
  },
  {
    id: 3,
    name: "Alimente o Futuro",
    city: "Belo Horizonte",
    description: "Distribuição de alimentos para famílias carentes.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleCategoryClick = (cat: string) => {
    navigate(`/ongs?categoria=${cat}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-transparent px-4 pt-32 pb-12 text-center">
        <h1 className="mb-4 font-extrabold text-gray-900 text-4xl md:text-5xl">
          Ajude causas reais com transparência
        </h1>
        <p className="mb-8 text-gray-600 text-lg md:text-xl">
          Encontre ONGs confiáveis para apoiar
        </p>
        <Link
          to="/ongs"
          className="bg-blue-700 hover:bg-blue-800 shadow px-8 py-3 rounded-lg font-semibold text-white transition"
        >
          Acessar ONGs
        </Link>
      </section>

      {/* Confiança */}
      <section className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto mb-12 px-4 max-w-4xl">
        {[
          {
            title: "ONGs com perfis completos",
            desc: "Transparência nas informações e histórico.",
          },
          {
            title: "Informações públicas e transparentes",
            desc: "Dados abertos para sua confiança.",
          },
          {
            title: "Plataforma focada em confiança",
            desc: "Segurança e seriedade nas doações.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-white shadow p-6 border border-gray-100 rounded-xl text-center"
          >
            <FaCheckCircle className="mb-2 text-green-500 text-3xl" />
            <h3 className="mb-1 font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mx-auto mb-16 px-4 max-w-3xl">
        <h2 className="mb-4 font-bold text-gray-800 text-2xl">Categorias</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-white hover:bg-blue-50 shadow-sm px-6 py-2 border border-blue-200 rounded-full font-medium text-blue-700 transition"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ONGs em destaque */}
      <section className="mx-auto mb-20 px-4 max-w-5xl">
        <h2 className="mb-6 font-bold text-gray-800 text-2xl">
          ONGs em destaque
        </h2>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {featuredOngs.map((ong) => (
            <div
              key={ong.id}
              className="flex flex-col bg-white shadow p-6 border border-gray-100 rounded-xl"
            >
              <h3 className="mb-1 font-semibold text-lg">{ong.name}</h3>
              <span className="mb-2 text-blue-700 text-sm">{ong.city}</span>
              <p className="flex-1 mb-4 text-gray-600">{ong.description}</p>
              <Link
                to={`/ong/${ong.id}`}
                className="bg-blue-700 hover:bg-blue-800 shadow mt-auto px-4 py-2 rounded font-medium text-white text-center transition"
              >
                Ver perfil
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
