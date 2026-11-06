import { useState } from "react";

const topicos = [
  {
    titulo: "Conta",
    perguntas: [
      [
        "Preciso de uma conta para conhecer as ONGs?",
        "Você pode consultar perfis de ONGs e publicações sem entrar. Para demonstrar interesse ou iniciar uma conversa com uma ONG, entre com uma conta de doador ativa.",
      ],
    ],
  },
  {
    titulo: "ONGs",
    perguntas: [
      [
        "Como demonstrar interesse em ajudar uma ONG?",
        "Entre com uma conta de doador ativa, abra o perfil da organização e selecione “Demonstrar interesse”. A ONG poderá ver seu registro. Se mudar de ideia, use “Cancelar interesse em ajudar” no mesmo perfil.",
      ],
    ],
  },
  {
    titulo: "Medalhas e verificação",
    perguntas: [
      [
        "O que é o cadastro verificado?",
        "É a medalha verde. Indica que a instituição passou pela validação institucional da plataforma: foi aprovada pela administração, teve a consulta cadastral na Receita Federal registrada e os documentos obrigatórios analisados e aprovados. É calculada automaticamente e deixa de aparecer se a instituição for suspensa ou deixar de atender a esses requisitos. Quando a aprovação precisou de análise manual por divergências nas conferências, o perfil informa que houve aprovação com ressalvas.",
      ],
      [
        "O que é o nível de transparência?",
        "É a medalha dourada, que muda de cor conforme o nível: Inicial, Em desenvolvimento, Avançada ou Exemplar. O nível é calculado a partir dos registros da plataforma (uso dos recursos, comprovantes, entregas com evidência e informações atualizadas). A instituição não escolhe o próprio nível, e clicar na medalha mostra os critérios usados. Ele é independente do cadastro verificado.",
      ],
      [
        "Como uma ONG consegue o cadastro verificado?",
        "Entre com a conta da ONG, abra “Minha instituição”, preencha os dados e envie os documentos obrigatórios. A administração analisa os documentos e a instituição. O antigo programa da Medalha Branca foi encerrado, e o histórico de quem participou continua disponível no perfil da ONG.",
      ],
    ],
  },
  {
    titulo: "Doações",
    perguntas: [
      [
        "Como faço uma doação?",
        "Abra o perfil da ONG e consulte as formas de ajuda que ela aceita. Se houver uma chave Pix, selecione “Copiar chave PIX”, abra o aplicativo do seu banco, informe o valor e confira o destinatário antes de confirmar. A transferência acontece no banco. Para doar materiais ou combinar outra forma de entrega, fale diretamente com a ONG pelos contatos do perfil.",
      ],
      [
        "Minha doação tem 100% de segurança?",
        "Não. O Donatio divulga os dados cadastrados pela ONG. Mesmo quando há cadastro verificado ou um nível de transparência alto, a plataforma não garante a transferência nem o uso do valor doado. Confira no banco quem vai receber o Pix e esclareça qualquer divergência com a ONG antes de enviar.",
      ],
    ],
  },
  {
    titulo: "Publicações",
    perguntas: [
      [
        "Onde encontro as novidades das ONGs?",
        "Selecione “Publicações” no cabeçalho para consultar as postagens das organizações. Abra uma publicação para ler seu conteúdo.",
      ],
    ],
  },
  {
    titulo: "Mensagens",
    perguntas: [
      [
        "Como iniciar uma conversa?",
        "Entre com uma conta de doador ativa e abra o perfil da ONG. Selecione “Conversar com a ONG” para abrir a conversa, escreva sua mensagem e envie.",
      ],
    ],
  },
];

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Ajuda() {
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca);
  const resultados = topicos
    .map(({ titulo, perguntas }) => ({
      titulo,
      perguntas: perguntas.filter(([pergunta, resposta]) =>
        normalizar([pergunta, resposta].join(" ")).includes(termo),
      ),
    }))
    .filter(({ perguntas }) => perguntas.length > 0);

  return (
    <div className="mx-auto max-w-3xl text-brand-text">
      <h1 className="font-bold text-3xl">Central de ajuda</h1>
      <p className="mt-3 text-brand-muted">
        O Donatio aproxima quem quer ajudar das ONGs que precisam de apoio. Aqui
        você pode conhecer o trabalho das organizações e descobrir como
        contribuir.
      </p>
      <label htmlFor="busca-ajuda" className="block mt-8 font-semibold">
        Buscar nas perguntas e respostas
      </label>
      <input
        id="busca-ajuda"
        type="search"
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        placeholder="Ex.: medalha, Pix ou conversa"
        className="bg-brand-surface mt-2 px-4 py-3 border border-brand-border rounded-xl w-full"
      />
      {resultados.map(({ titulo, perguntas }) => (
        <section key={titulo} className="mt-8">
          <h2 className="mb-3 font-semibold text-xl">{titulo}</h2>
          <div className="bg-brand-surface border border-brand-border rounded-xl divide-y divide-brand-border">
            {perguntas.map(([pergunta, resposta]) => (
              <details
                key={pergunta}
                className="px-5 sm:px-8 sm:open:pb-8 open:pb-6"
              >
                <summary className="py-5 font-semibold cursor-pointer">
                  {pergunta}
                </summary>
                <p className="max-w-prose leading-7">{resposta}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      {resultados.length === 0 && (
        <div className="mt-6">
          <p role="status">
            Nenhuma pergunta encontrada. Tente uma palavra como “Pix” ou
            “mensagem”.
          </p>
          <button
            type="button"
            className="mt-3 font-semibold underline"
            onClick={() => setBusca("")}
          >
            Ver todas as perguntas
          </button>
        </div>
      )}
    </div>
  );
}
