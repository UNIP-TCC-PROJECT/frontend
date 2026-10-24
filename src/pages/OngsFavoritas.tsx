import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import FavoritoButton from "../components/FavoritoButton";
import { api, imagemUrl } from "../services/api";

interface Favorito {
  id: number;
  ongId: number;
  ong: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  createdAt: string;
}

export default function OngsFavoritas() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro("");

    api
      .get<Favorito[]>("/favoritos")
      .then(({ data }) => {
        if (ativo) setFavoritos(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar suas ONGs favoritas.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-sans text-2xl text-brand-text sm:text-3xl">
          Minhas ONGs favoritas
        </h1>
        <p className="mt-2 text-brand-muted">
          Acompanhe as organizações que você escolheu para manter por perto.
        </p>
      </div>

      {carregando ? (
        <p role="status" className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-brand-muted">
          Carregando suas ONGs favoritas...
        </p>
      ) : erro ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {erro}
        </p>
      ) : favoritos.length === 0 ? (
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <p className="text-brand-muted">
            Você ainda não favoritou nenhuma ONG.
          </p>
          <Link
            to="/ongs"
            className="mt-4 inline-flex rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-brand-onPrimary transition-colors hover:bg-brand-primaryDark"
          >
            Explorar ONGs
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {favoritos.map((favorito) => {
            const foto = imagemUrl(favorito.ong.profileImage);

            return (
              <li
                key={favorito.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <Link
                  to={`/ongs/${favorito.ongId}`}
                  className="flex min-w-0 items-center gap-4"
                >
                  {foto ? (
                    <img
                      src={foto}
                      alt={`Logo de ${favorito.ong.name}`}
                      className="h-14 w-14 shrink-0 rounded-full bg-brand-champagne object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-bold text-brand-primaryText"
                    >
                      {favorito.ong.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate font-semibold text-brand-text">
                    {favorito.ong.name}
                  </span>
                </Link>

                <FavoritoButton
                  ongId={favorito.ongId}
                  onChange={(favoritada) => {
                    if (!favoritada) {
                      setFavoritos((atuais) =>
                        atuais.filter((item) => item.ongId !== favorito.ongId),
                      );
                    }
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
