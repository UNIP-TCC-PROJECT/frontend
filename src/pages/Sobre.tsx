import { Link } from "react-router-dom";

const destaques = [
  {
    titulo:
      "Aproximamos doadores e organizações em um espaço seguro e transparente",
    descricao: "Verificações automáticas e manuais.",
  },
  {
    titulo:
      "Exibimos o máximo possível de informações de cada ONG, plantando assim um ambiente seguro e confiável",
    descricao:
      "Pedimos só o necessário para validar as instituições e emitir os Pix (CNPJ e documentos da ONG, CPF do representante e do doador). Esses dados pessoais não aparecem publicamente.",
  },
  {
    titulo:
      "Possibilitamos o engajamento das ONGs, a partir da criação de publicações, metas e demais mecanismos que possibilitem, engajar seus apoiadores.",
    descricao:
      "A plataforma oferece recursos de interação, para criação de laços entre instituições e doadores.",
  },
];

export default function Sobre() {
  return (
    <main className="py-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="mt-4 font-sans text-brand-text text-3xl sm:text-4xl">
          Sobre nós
        </h1>
      </header>

      <article className="relative bg-[#fffaf0] shadow-md mx-auto border border-[#ba8e23] rounded-3xl max-w-4xl overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-3 border border-[#ba8e23] rounded-2xl pointer-events-none"
        />

        <div className="relative p-7 sm:p-10 lg:p-14">
          <p className="text-brand-text text-lg leading-relaxed">
            Somos uma teia que conecta doadores procurando ONGs, a ONGs que
            necessitam de doadores. Temos uma ampla gama de funcionalidades em
            nossos sistema, que visa a interação, transparência e segurança
            entre ONG e DOADOR.
            <p>
              Chats, sistemas de denuncias, verificações automáticas a partir do
              CNPJ. Além também de administradores, concedendo verificações
              extras e agindo sobre denuncias.
            </p>
          </p>

          <div className="gap-4 grid sm:grid-cols-3 mt-8">
            {destaques.map((item) => (
              <section
                key={item.titulo}
                className="bg-white/70 p-5 border border-[#ba8e23] rounded-2xl"
              >
                <h2 className="font-semibold text-brand-text">{item.titulo}</h2>
                <p className="mt-2 text-brand-muted text-sm leading-relaxed">
                  {item.descricao}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-9 pt-6 border-[#e6f8d2] border-t text-center">
            <p className="text-brand-text">
              Para demais dúvidas acesse a página de AJUDA abaixo, e navegue em
              nossos tópicos.
            </p>
            <Link
              to="/ajuda"
              className="inline-flex bg-brand-primary hover:bg-brand-primaryDark mt-4 px-6 py-3 rounded-full font-semibold text-brand-onPrimary transition-colors"
            >
              Acessar a Ajuda
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
