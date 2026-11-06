import { FaKey, FaUserShield, FaUserLock, FaClock, FaHistory, FaServer } from "react-icons/fa";
import type { ComponentType } from "react";

// Somente controles que existem e são exercitados por testes automatizados do projeto (ver RELATORIO-SEGURANCA).
const controls: { icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>; title: string; text: string }[] = [
  { icon: FaKey, title: "Proteção de senhas", text: "As senhas são guardadas de forma irreversível (hash com sal); nem a equipe consegue lê-las." },
  { icon: FaUserShield, title: "Controle de acesso por perfil", text: "Doadores, ONGs e administradores só acessam o que o seu perfil permite, e uma ONG nunca vê dados de outra." },
  { icon: FaUserLock, title: "Autenticação adicional para administradores", text: "Administradores precisam de um segundo fator (código de aplicativo) para analisar documentos e prestações de contas." },
  { icon: FaClock, title: "Sessões com expiração e revogação", text: "Os acessos expiram e podem ser encerrados; a conta é protegida contra tentativas repetidas de login." },
  { icon: FaHistory, title: "Registro de ações importantes", text: "Aprovações, análises e mudanças financeiras ficam numa trilha de auditoria protegida contra alteração." },
  { icon: FaServer, title: "Proteção das operações do servidor", text: "Pagamentos só são confirmados pelo provedor, os valores são recalculados no servidor e as informações são validadas antes de serem salvas." },
];

export default function SecurityInfo() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-muted">Estes são os controles técnicos que a plataforma mantém ativos. Eles protegem o sistema e <strong>não</strong> fazem parte da avaliação de transparência da instituição.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {controls.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4">
            <Icon className="mt-1 shrink-0 text-brand-gold" aria-hidden />
            <div><h4 className="text-sm font-semibold text-brand-text">{title}</h4><p className="mt-1 text-xs leading-relaxed text-brand-muted">{text}</p></div>
          </li>
        ))}
      </ul>
      <p className="rounded-2xl bg-brand-champagne p-4 text-xs leading-relaxed text-brand-primaryText">
        <strong>Estado atual:</strong> estes controles foram verificados por testes automatizados do projeto em ambiente de desenvolvimento.
        Ainda não passaram por auditoria externa nem por homologação em produção; por isso não os apresentamos como plenamente validados.
      </p>
    </div>
  );
}
