import { Link } from "react-router-dom";

const destaques = [
  {
    titulo: "Aproximamos doadores e organizações em um espaço seguro e transparente",
    descricao:
      "Verificações automáticas e manuais.",
  },
  {
    titulo: "Exibimos o máximo possível de informações de cada ONG e cada DOADOR, plantando assim um ambiente seguro e confiável",
    descricao:
      "Nunca solicitamos qualquer dado sensível.",
  },
  {
    titulo: "Possibilitamos o engajamento das ONGs, a partir da criação de publicações, metas e demais mecanismos que possibilitem, engajar seus apoiadores.",
    descricao:
      "A plataforma oferece recursos de interação, para criação de laços entre instituições e doadores.",
  },
];

export default function Sobre() {
  return (
    <main className="py-6 sm:py-10">
      <header className="mb-8 text-center">


        <h1 className="mt-4 font-sans text-3xl text-brand-text sm:text-4xl">
          Sobre nós
        </h1>
      </header>

      <article className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#ba8e23] bg-[#fffaf0] shadow-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-2xl border border-[#ba8e23]"
        />

        <div className="relative p-7 sm:p-10 lg:p-14">
          <p className="text-lg leading-relaxed text-brand-text">
            Somos uma teia que conecta doadores procurando ONGs, a ONGs que
            necessitam de doadores. Temos uma ampla gama de funcionalidades em nossos
            sistema, que visa a interação, transparência e segurança entre ONG e
            DOADOR. 
            <p>Chats, sistemas de denuncias, verificações automáticas a
            partir do CNPJ. Além também de administradores, concedendo verificações extras e
            agindo sobre denuncias.</p> 
          </p>


          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {destaques.map((item) => (
              <section
                key={item.titulo}
                className="rounded-2xl border border-[#ba8e23] bg-white/70 p-5"
              >
                <h2 className="font-semibold text-brand-text">{item.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {item.descricao}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-9 border-t border-[#e6f8d2] pt-6 text-center">
            <p className="text-brand-text">
              Para demais dúvidas acesse a página de AJUDA
            abaixo, e navegue em nossos tópicos.
            </p>
            <Link
              to="/ajuda"
              className="mt-4 inline-flex rounded-full bg-brand-primary px-6 py-3 font-semibold text-brand-onPrimary transition-colors hover:bg-brand-primaryDark"
            >
              Acessar a Ajuda
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
