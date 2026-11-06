import { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";

import FavoritoButton from "./FavoritoButton";
import { imagemUrl } from "../services/api";
import { useAuth } from "../context/useAuth";

export interface PublicationCardData {
  id: number;
  description: string;
  imageUrl: string;
  ongId: number;
  createdAt: string;
  ong: {
    id: number;
    name: string;
    profileImage?: string | null;
  };
}

export default function PublicationCard({ publication }: { publication: PublicationCardData }) {
  const { user } = useAuth();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const hasLongDescription = publication.description.length > 160;
  const date = new Date(publication.createdAt);

  return (
    <article className="mx-auto w-full max-w-[545px] rounded-[10px] border-[5px] border-black bg-[#FFCA32] p-2.5 shadow-[8px_8px_0_#75551A] sm:p-3">
      <Link
        to={`/ongs/${publication.ongId}`}
        className="flex min-h-[72px] items-center gap-3 rounded-[16px] border-[4px] border-black bg-[#FFD43B] px-3 py-2 shadow-[5px_5px_0_#75551A] sm:gap-4 sm:px-5"
      >
        {publication.ong.profileImage ? (
          <img
            src={imagemUrl(publication.ong.profileImage) ?? ""}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border-[3px] border-[#A51645] bg-white object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[#A51645] bg-[#F4EBDD] text-lg font-bold text-black sm:h-12 sm:w-12">
            {publication.ong.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 break-words text-2xl font-extrabold leading-tight text-black sm:text-[34px]">
          {publication.ong.name}
        </span>
      </Link>

      <div className="my-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-xl font-extrabold leading-none text-black sm:my-4 sm:px-1 sm:text-[30px]">
        <time dateTime={publication.createdAt}>
          {date.toLocaleDateString("pt-BR")}
        </time>
        <time dateTime={publication.createdAt} className="flex items-center gap-2">
          <FaRegClock aria-hidden="true" className="text-3xl sm:text-5xl" />
          {date
            .toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(" ", "")}
        </time>
      </div>

      <div className="border-[5px] border-black bg-[#FFD43B] p-2 shadow-[7px_7px_0_#75551A] sm:p-2.5">
        <img
          src={imagemUrl(publication.imageUrl) ?? ""}
          alt={`Publicação de ${publication.ong.name}`}
          className="aspect-[1.45/1] w-full object-cover"
        />
      </div>

      <div className="my-3 min-h-[112px] rounded-[30px] border-[3px] border-[#604611] bg-[#896719] p-3 text-white shadow-[3px_4px_0_#75551A] sm:my-4 sm:min-h-[130px] sm:rounded-[34px] sm:p-4">
        <p className={`whitespace-pre-wrap break-words text-sm font-medium leading-[1.35] [text-shadow:1px_1px_2px_#000] sm:text-base ${hasLongDescription && !descriptionExpanded ? "line-clamp-4" : ""}`}>
          {publication.description}
        </p>
        {hasLongDescription && (
          <button
            type="button"
            aria-expanded={descriptionExpanded}
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-2 font-bold text-[#FFD43B] underline underline-offset-2 hover:text-white"
          >
            {descriptionExpanded ? "Mostrar menos" : "Mostrar mais"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
        {user?.type === "DOADOR" && user.status === "ATIVO" ? (
          <FavoritoButton
            ongId={publication.ongId}
            className="inline-flex items-center gap-2 border-[4px] border-[#A51645] bg-[#FFD43B] px-3 py-2 text-lg font-extrabold text-[#A51645] shadow-[5px_5px_0_#75551A] sm:px-3.5 sm:text-xl"
          />
        ) : (
          <span aria-hidden="true" />
        )}
        <Link
          to={`/publicacoes/${publication.id}`}
          className="border-[4px] border-[#75551A] bg-[#FFD43B] px-6 py-2.5 text-center text-lg font-extrabold text-[#604611] shadow-[5px_5px_0_#75551A] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_#75551A] sm:px-8 sm:text-xl"
        >
          Ver Publicação
        </Link>
      </div>
    </article>
  );
}
