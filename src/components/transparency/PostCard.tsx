import { Link } from "react-router-dom";
import { FaClipboardList, FaFilePdf, FaHourglassHalf } from "react-icons/fa";
import { fmtDay, postFileUrl, shortHash } from "../../services/transparency";
import type { Post } from "../../services/transparency";
import ClassificationChip from "./ClassificationChip";

export default function PostCard({ post }: { post: Post }) {
  const images = post.images.length ? post.images : post.imageUrl ? [{ id: "legacy", url: post.imageUrl }] : [];
  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-xs">
      {images.length > 0 && (
        <div className={`grid gap-0.5 bg-brand-border ${images.length > 1 ? "grid-cols-2" : ""}`}>
          {images.slice(0, 4).map((img) => (
            <img key={img.id} src={postFileUrl(img.url)} alt={`Foto da publicação de ${fmtDay(post.createdAt)}`} loading="lazy" className="h-56 w-full object-cover" />
          ))}
        </div>
      )}
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-brand-champagne px-2.5 py-1 font-semibold text-brand-goldText">{post.categoryLabel}</span>
          <time dateTime={post.createdAt} className="text-brand-muted">{fmtDay(post.createdAt)}</time>
          <ClassificationChip value={post.classification} />
        </div>

        <p className="whitespace-pre-wrap text-brand-text">{post.description}</p>

        {post.campaign && <p className="text-sm text-brand-muted">Campanha: <Link className="font-medium text-brand-goldText underline" to={`/campanhas/${post.campaign.id}`}>{post.campaign.title ?? "ver campanha"}</Link></p>}

        {post.documents.length > 0 && (
          <ul className="space-y-1 text-sm">
            {post.documents.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2">
                <FaFilePdf className="text-brand-goldText" aria-hidden />
                <a className="font-medium underline" href={postFileUrl(d.url)} target="_blank" rel="noreferrer">Documento analisado</a>
                <span className="text-xs text-brand-muted" title="Hash SHA-256: impressão digital do arquivo. Ajuda a identificar alterações, mas não comprova sozinho a autenticidade.">SHA-256 {shortHash(d.sha256)}</span>
              </li>
            ))}
          </ul>
        )}

        {post.evidenceStatus.awaitingAnalysis > 0 && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-champagne p-2.5 text-xs text-brand-primaryText">
            <FaHourglassHalf aria-hidden />{post.evidenceStatus.awaitingAnalysis} arquivo(s) aguardando análise: ainda não são considerados comprovados e não aparecem aqui.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
          <Link to={`/publicacoes/${post.id}`} className="font-medium text-brand-primaryText underline">Ver publicação</Link>
          {post.accountability.available && (
            <Link to={`/publicacoes/${post.id}/prestacao`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-brand-onPrimary shadow-sm transition hover:bg-brand-primaryDark">
              <FaClipboardList aria-hidden />Ver prestação de contas desta ação
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
