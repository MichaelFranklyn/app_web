"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { postSession } from "@/utils/auth/session";
import { getCookie } from "@/utils/cookies/clientCookie";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface ImpersonationData {
  userName?: string;
  companyName?: string;
  /** Nome do SU que emprestou a sessão. Ausente = sessão normal. */
  impersonatedBy?: string;
}

/**
 * Faixa fixa no topo enquanto um super usuário está usando o sistema como
 * outra pessoa.
 *
 * Existe por duas razões, e a segunda é a que importa: sem um aviso constante,
 * é fácil esquecer que se está numa conta emprestada e tomar uma ação de
 * verdade — criar um pedido, apagar um cliente — achando que é a própria. A
 * primeira é ter uma saída sempre à mão.
 *
 * Não renderiza nada em sessão comum, que é o caso de quase todo carregamento.
 */
export function ImpersonationBanner() {
  const [data, setData] = useState<ImpersonationData | null>(null);
  const { execute, isLoading } = useAsyncAction();

  useEffect(() => {
    setData(getCookie<ImpersonationData>("userData"));
  }, []);

  if (!data?.impersonatedBy) return null;

  const handleExit = async () => {
    await execute(
      () =>
        postSession(
          { action: "stopImpersonation" },
          "Não foi possível voltar ao console."
        ),
      {
        onSuccess() {
          // `replace` e não `router.push`: a sessão inteira mudou, e um
          // client-side nav manteria o cache do Apollo com os dados da conta
          // emprestada.
          window.location.replace("/platform");
        },
      }
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-8 bg-(--purple) px-16 py-8 text-white">
      <div className="flex min-w-0 items-center gap-8">
        <ShieldAlert size={16} className="shrink-0" />
        <span className="truncate text-[13px]">
          Você está como <strong>{data.userName}</strong>
          {data.companyName && (
            <>
              {" "}
              em <strong>{data.companyName}</strong>
            </>
          )}
          . Tudo que fizer aqui fica registrado como ação dessa pessoa.
        </span>
      </div>

      <Button.Root
        appearance="solid"
        color="neutral"
        size="xs"
        loading={isLoading}
        onClick={handleExit}
      >
        <Button.Title>Voltar ao console</Button.Title>
      </Button.Root>
    </div>
  );
}
