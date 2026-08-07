"use client";

import { STATE_OPTIONS } from "@/app/(inside)/_shared/brazilStates";
import { FilterField } from "@/components/Filters";
import { useMemo } from "react";

/**
 * Campos do painel de filtros do relatório de clientes.
 *
 * Os mesmos da carteira em `(operations)/clients`, menos os que não fazem
 * sentido aqui: o vendedor já está na barra de cima (é o recorte do relatório
 * inteiro), e rede/segmento exigiriam os catálogos da empresa — que a carteira
 * carrega porque é a tela de cadastro, e este papel não precisa para conferir.
 *
 * O recorte vai para a QUERY (a tabela pagina no servidor) — ver
 * `CLIENTS_REPORT_TABLE_FIELDS`.
 */
export const useClientsReportFilters = (): FilterField[] =>
  useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Razão social ou nome fantasia",
      },
      {
        type: "select",
        key: "state",
        label: "Estado",
        placeholder: "Todos os estados",
        options: STATE_OPTIONS,
      },
      {
        type: "select",
        key: "needsAttention",
        label: "Cadastro",
        placeholder: "Todos os cadastros",
        options: [
          { value: "true", label: "Precisa de atenção" },
          { value: "false", label: "Sem pendência" },
        ],
      },
    ],
    []
  );
