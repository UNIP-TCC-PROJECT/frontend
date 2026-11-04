import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  errorMessage,
  fmtCnpj,
  fmtDate,
  statusColor,
  statusLabel,
} from "../../services/organizations";
import type { OrgStatus, Organization } from "../../services/organizations";

export default function AdminValidacoes() {
  const [filtro, setFiltro] = useState<OrgStatus | "">("EM_ANALISE");
  const [lista, setLista] = useState<Organization[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get<Organization[]>("/admin/organizations", {
        params: filtro ? { status: filtro } : {},
      })
      .then((r) => {
        setLista(r.data);
        setErro("");
      })
      .catch((e) => setErro(errorMessage(e)));
  }, [filtro]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-xl">Validação institucional</h1>
        <select
          className="px-3 py-2 border rounded text-sm"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as OrgStatus | "")}
        >
          <option value="">Todas</option>
          {(Object.keys(statusLabel) as OrgStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      </div>
      {erro && (
        <p role="alert" className="text-red-700 text-sm">
          {erro}
        </p>
      )}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Instituição</th>
              <th>CNPJ</th>
              <th>Status</th>
              <th>Atualizada</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lista.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.tradeName ?? o.legalName}</td>
                <td>{fmtCnpj(o.cnpj)}</td>
                <td>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColor[o.status]}`}
                  >
                    {statusLabel[o.status]}
                  </span>
                </td>
                <td>{fmtDate(o.updatedAt)}</td>
                <td>
                  <Link
                    className="text-blue-700 underline"
                    to={`/admin/validacoes/${o.id}`}
                  >
                    Analisar
                  </Link>
                </td>
              </tr>
            ))}
            {!lista.length && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={5}>
                  Nenhuma instituição neste filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
