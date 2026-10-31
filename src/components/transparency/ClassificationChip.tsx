import { FaFileAlt, FaCheckCircle, FaPen } from "react-icons/fa";
import { classificationInfo } from "../../services/transparency";
import type { Classification } from "../../services/transparency";

const style: Record<Classification, string> = {
  INSTITUCIONAL: "border-brand-border bg-brand-background text-brand-muted",
  DOCUMENTADA: "border-brand-gold bg-brand-champagne text-brand-goldText",
  EVIDENCIAS_ANALISADAS: "border-emerald-700/30 bg-emerald-50 text-emerald-800",
};
const icon = { INSTITUCIONAL: FaPen, DOCUMENTADA: FaFileAlt, EVIDENCIAS_ANALISADAS: FaCheckCircle };

export default function ClassificationChip({ value }: { value: Classification }) {
  const info = classificationInfo[value];
  const Icon = icon[value];
  return (
    <span title={info.description} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style[value]}`}>
      <Icon aria-hidden />{info.label}
      <span className="sr-only">. {info.description}</span>
    </span>
  );
}
