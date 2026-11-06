import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { fmtDate } from "../../services/organizations";
import {
  paymentErrorMessage,
  paymentStatusColor,
  paymentStatusLabel,
} from "../../services/paymentAccounts";
import type { AdminPaymentAccount } from "../../services/paymentAccounts";

const btn =
  "rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed";

/** Conta de recebimento (subconta Asaas) da ONG, no painel do administrador. */
export default function PaymentAccountCard({
  organizationId,
  approved,
}: {
  organizationId: string;
  approved: boolean;
}) {
  const base = `/admin/payment-accounts/${organizationId}`;
  const [acc, setAcc] = useState<AdminPaymentAccount | null>(null);
  const [income, setIncome] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  const load = useCallback(async () => {
    try {
      setAcc((await api.get<AdminPaymentAccount>(base)).data);
    } catch (e) {
      setErro(paymentErrorMessage(e));
    }
  }, [base]);
  useEffect(() => {
    void load();
  }, [load]);

  async function act(path: string, body?: object) {
    setBusy(true);
    setErro("");
    try {
      setAcc(
        (await api.post<AdminPaymentAccount>(`${base}${path}`, body)).data,
      );
    } catch (e) {
      setErro(paymentErrorMessage(e));
      await load();
    } finally {
      setBusy(false);
    }
  }

  const valor = Number(income.replace(",", "."));
  const podeCriar = acc?.canProvision && approved;

  return (
    <section className="bg-white p-4 border rounded-lg">
      <h2 className="mb-1 font-semibold">Conta de recebimento (Asaas)</h2>
      <p className="mb-3 text-gray-600 text-sm">
        Cada ONG recebe as doações na própria subconta. A chave de API da
        subconta fica cifrada no servidor e nunca é exibida.
      </p>
      {erro && (
        <p role="alert" className="mb-2 text-red-700 text-sm">
          {erro}
        </p>
      )}
      {!acc ? (
        <p className="text-gray-500 text-sm">Carregando…</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            {acc.status ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusColor[acc.status]}`}
              >
                {paymentStatusLabel[acc.status]}
              </span>
            ) : (
              <span className="text-gray-600">Conta ainda não criada.</span>
            )}
            {acc.environment && (
              <span className="text-gray-500">Ambiente: {acc.environment}</span>
            )}
          </div>
          {acc.statusDetail && (
            <p className="text-red-700">{acc.statusDetail}</p>
          )}
          {acc.exists && (
            <dl className="gap-x-6 gap-y-1 grid md:grid-cols-2 text-gray-700">
              <div>
                <dt className="inline font-medium">Conta no provedor: </dt>
                <dd className="inline">{acc.providerAccountId ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Carteira: </dt>
                <dd className="inline">
                  {acc.walletIdTail ? `…${acc.walletIdTail}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Situação no provedor: </dt>
                <dd className="inline">{acc.providerStatus?.general ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Última consulta: </dt>
                <dd className="inline">{fmtDate(acc.lastCheckedAt)}</dd>
              </div>
            </dl>
          )}

          {!approved && !acc.exists && (
            <p className="text-gray-600">
              A conta só pode ser aberta depois da aprovação institucional.
            </p>
          )}

          {podeCriar && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="block mb-1 text-gray-700">
                  Faturamento mensal estimado (R$)
                </span>
                <input
                  className="px-3 py-1.5 border rounded w-44"
                  inputMode="decimal"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="ex.: 8000"
                />
              </label>
              <button
                className={btn}
                disabled={busy || !(valor >= 1)}
                onClick={() => void act("", { incomeValue: valor })}
              >
                {acc.exists ? "Tentar novamente" : "Abrir conta de recebimento"}
              </button>
            </div>
          )}

          {acc.exists && acc.status !== "FALHA" && (
            <div className="flex flex-wrap gap-2">
              <button
                className={btn}
                disabled={busy}
                onClick={() => void act("/refresh")}
              >
                Atualizar situação
              </button>
              {acc.environment === "sandbox" &&
                acc.status === "AGUARDANDO_APROVACAO" && (
                  <button
                    className={`${btn} bg-gray-700`}
                    disabled={busy}
                    onClick={() => void act("/sandbox-approve")}
                  >
                    Aprovar no Sandbox
                  </button>
                )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
