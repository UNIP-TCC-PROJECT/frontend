import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { carregarSelos } from "../../services/selos";
import type { SelosOng } from "../../services/selos";
import { CadastroVerificadoChip, NivelTransparenciaChip, VerificacaoCnpjChip } from "./SelosDaOng";

/** Painel da própria ONG (Perfil): como as duas medalhas estão hoje e onde agir. */
export default function SelosDaInstituicao() {
  const { user } = useAuth();
  const [selos, setSelos] = useState<SelosOng | undefined>();
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    if (user?.type !== "ONG") return;
    let ativo = true;
    carregarSelos([user.id])
      .then((r) => ativo && setSelos(r[user.id]))
      .catch(() => undefined)
      .finally(() => ativo && setCarregado(true));
    return () => { ativo = false; };
  }, [user?.id, user?.type]);

  if (user?.type !== "ONG" || !carregado) return null;
  const verificado = selos?.cadastroVerificado.verificado === true;

  return (
    <section aria-labelledby="medalhas-instituicao" className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
      <h2 id="medalhas-instituicao" className="mb-1 text-xl font-sans text-brand-text">Medalhas da instituição</h2>
      <p className="mb-4 text-sm text-brand-muted">A conferência do CNPJ, a validação institucional e o nível de transparência são indicadores independentes, com critérios próprios.</p>

      <dl className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-brand-border bg-brand-background p-4">
          <dt className="mb-2 text-sm font-semibold text-brand-text">Verificação automática do CNPJ</dt>
          <dd className="space-y-2 text-sm text-brand-muted">
            {selos?.verificacaoCnpj.verificado ? <VerificacaoCnpjChip verificado /> : <p>Critérios automáticos não atendidos no cadastro.</p>}
            <p>Considera situação cadastral, nome informado, natureza jurídica e pontuação das atividades econômicas (CNAEs), com base nos dados consultados no cadastro. Esta conferência não substitui a análise de documentos.</p>
          </dd>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-background p-4">
          <dt className="mb-2 text-sm font-semibold text-brand-text">Cadastro verificado</dt>
          <dd className="space-y-2 text-sm text-brand-muted">
            {verificado ? <CadastroVerificadoChip cadastro={selos?.cadastroVerificado} /> : <p>Ainda não verificado.</p>}
            <p>
              {verificado
                ? "A instituição passou pela validação institucional. Se for suspensa ou um documento obrigatório deixar de estar aprovado, o selo é retirado automaticamente."
                : "Depende da validação institucional: instituição aprovada, consulta cadastral registrada e documentos obrigatórios aprovados."}
            </p>
          </dd>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-background p-4">
          <dt className="mb-2 text-sm font-semibold text-brand-text">Nível de transparência</dt>
          <dd className="space-y-2 text-sm text-brand-muted">
            {selos?.nivelTransparencia ? <NivelTransparenciaChip nivel={selos.nivelTransparencia} /> : <p>Disponível depois da aprovação da instituição.</p>}
            <p>Muda conforme a prestação de contas: uso dos recursos comprovado, entregas com evidência e informações atualizadas.</p>
          </dd>
        </div>
      </dl>

      <Link to="/minha-instituicao" className="mt-4 inline-block text-sm font-semibold text-brand-primaryText underline">
        Gerenciar os documentos e dados da instituição
      </Link>
    </section>
  );
}
