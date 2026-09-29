import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { CATEGORIES as categories } from "../constants/categories";

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
      <section className="relative left-1/2 -mx-[50vw] -mt-32 flex flex-col flex-1 justify-center items-center bg-gradient-to-b from-brand-sage to-transparent px-4 pt-40 pb-12 w-screen text-center">
        <h1 className="mb-4 font-serif text-brand-text text-4xl md:text-5xl">
          Ajude causas reais com transparência
        </h1>
        <p className="mb-8 text-brand-text/70 text-lg md:text-xl">
          Encontre ONGs confiáveis para apoiar
        </p>
        <Link
          to="/ongs"
          className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs px-8 py-3 rounded-full font-semibold text-brand-background transition-all"
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
            className="flex flex-col items-center bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-text/10 hover:border-brand-text/30 rounded-2xl text-center transition-all"
          >
            <FaCheckCircle className="mb-2 text-brand-primary text-3xl" />
            <h3 className="mb-1 font-semibold text-brand-text text-lg">{item.title}</h3>
            <p className="text-brand-text/60 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mx-auto mb-16 px-4 max-w-3xl">
        <h2 className="mb-4 font-serif text-brand-text text-2xl">Categorias</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-brand-surface hover:bg-brand-sage shadow-sm px-6 py-2 border border-brand-text/15 rounded-full font-medium text-brand-primary transition"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ONGs em destaque */}
      <section className="mx-auto mb-20 px-4 max-w-5xl">
        <h2 className="mb-6 font-serif text-brand-text text-2xl">
          ONGs em destaque
        </h2>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {featuredOngs.map((ong) => (
            <div
              key={ong.id}
              className="group flex flex-col bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-text/10 hover:border-brand-text/30 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex justify-center items-center bg-brand-sage rounded-full ring-2 ring-brand-primary/20 w-11 h-11 font-serif font-bold text-brand-primary shrink-0">
                  {ong.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brand-text group-hover:text-brand-primary text-base transition-colors">
                    {ong.name}
                  </h3>
                  <span className="text-brand-text/60 text-xs">{ong.city}</span>
                </div>
              </div>
              <p className="flex-1 mb-4 text-brand-text/70 text-sm leading-relaxed">
                {ong.description}
              </p>
              <Link
                to={`/ong/${ong.id}`}
                className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs mt-auto px-4 py-2.5 rounded-full font-semibold text-brand-background text-xs text-center transition-all"
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
