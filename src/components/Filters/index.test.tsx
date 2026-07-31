import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Filters } from "./index";
import { FilterField } from "./interface";

const FIELDS: FilterField[] = [
  {
    type: "select",
    key: "sellerId",
    label: "Vendedor",
    placeholder: "Todos os vendedores",
    options: [
      { value: "s1", label: "Carlos Andrade" },
      { value: "s2", label: "Marina Lopes" },
    ],
  },
  {
    type: "date-range",
    key: "invoicedFrom",
    toKey: "invoicedTo",
    label: "Data de faturamento",
  },
];

const TEXT_FIELD: FilterField = {
  type: "text",
  key: "search",
  label: "Buscar",
  placeholder: "Razão social ou nome fantasia",
};

const panel = () =>
  document.querySelector("[data-filters-panel]") as HTMLElement;

describe("Filters", () => {
  it("só mostra o painel depois de clicar no botão", async () => {
    render(<Filters fields={FIELDS} values={{}} onChange={vi.fn()} />);
    expect(panel()).toBeNull();

    await userEvent.click(screen.getByText("Filtros"));
    expect(within(panel()).getByText("Vendedor")).toBeInTheDocument();
    expect(
      within(panel()).getByText("Data de faturamento")
    ).toBeInTheDocument();
  });

  it("conta os filtros ativos no botão", () => {
    render(
      <Filters
        fields={FIELDS}
        values={{ sellerId: "s1", invoicedFrom: "2026-07-01" }}
        onChange={vi.fn()}
      />
    );
    // Dois campos preenchidos: o período conta uma vez só, mesmo com as duas
    // pontas — aqui só a inicial está preenchida.
    expect(screen.getByText("Filtros (2)")).toBeInTheDocument();
  });

  it("escolher um vendedor devolve o patch com a chave do campo", async () => {
    const onChange = vi.fn();
    render(<Filters fields={FIELDS} values={{}} onChange={onChange} />);

    await userEvent.click(screen.getByText("Filtros"));
    await userEvent.click(
      within(panel()).getByPlaceholderText("Todos os vendedores")
    );
    await userEvent.click(screen.getByText("Marina Lopes"));

    expect(onChange).toHaveBeenCalledWith({ sellerId: "s2" });
  });

  it("limpar apaga as chaves do painel numa tacada só", async () => {
    const onChange = vi.fn();
    render(
      <Filters
        fields={FIELDS}
        values={{ sellerId: "s1", invoicedFrom: "2026-07-01" }}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByText("Filtros (2)"));
    await userEvent.click(within(panel()).getByText("Limpar filtros"));

    expect(onChange).toHaveBeenCalledWith({
      sellerId: undefined,
      invoicedFrom: undefined,
      invoicedTo: undefined,
    });
  });

  it("limpar também apaga a busca quando ela é campo do painel", async () => {
    const onChange = vi.fn();
    render(
      <Filters
        fields={[TEXT_FIELD, ...FIELDS]}
        values={{ search: "padaria" }}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByText("Filtros (1)"));
    await userEvent.click(within(panel()).getByText("Limpar filtros"));

    expect(onChange).toHaveBeenCalledWith({
      search: undefined,
      sellerId: undefined,
      invoicedFrom: undefined,
      invoicedTo: undefined,
    });
  });

  it("não renderiza campo escondido (vendedor só para gestor)", async () => {
    const fields: FilterField[] = [
      { ...FIELDS[0], hidden: true } as FilterField,
      FIELDS[1],
    ];
    render(<Filters fields={fields} values={{}} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Filtros"));
    expect(within(panel()).queryByText("Vendedor")).toBeNull();
    expect(
      within(panel()).getByText("Data de faturamento")
    ).toBeInTheDocument();
  });

  it("digitar na busca usa o onTextChange, que respeita o debounce do campo", async () => {
    const onChange = vi.fn();
    const onTextChange = vi.fn();

    // O campo é controlado por `values`: sem devolver o que foi digitado, ele
    // não acumularia as letras. Na tela quem faz isso é o `inputValues` do
    // useTableFilters, que o setFilter atualiza na hora.
    function Harness() {
      const [values, setValues] = useState<Record<string, string>>({});
      return (
        <Filters
          fields={[TEXT_FIELD]}
          values={values}
          onChange={onChange}
          onTextChange={(key, value) => {
            onTextChange(key, value);
            setValues(value ? { [key]: value } : {});
          }}
        />
      );
    }

    render(<Harness />);
    await userEvent.click(screen.getByText("Filtros"));
    await userEvent.type(
      within(panel()).getByPlaceholderText("Razão social ou nome fantasia"),
      "pa"
    );

    // Pelo `onChange` cada tecla seria uma consulta ao backend na hora.
    expect(onChange).not.toHaveBeenCalled();
    expect(onTextChange).toHaveBeenLastCalledWith("search", "pa");
  });

  it("sem onTextChange, a busca cai no onChange como qualquer campo", async () => {
    const onChange = vi.fn();
    render(<Filters fields={[TEXT_FIELD]} values={{}} onChange={onChange} />);

    await userEvent.click(screen.getByText("Filtros"));
    await userEvent.type(
      within(panel()).getByPlaceholderText("Razão social ou nome fantasia"),
      "p"
    );

    expect(onChange).toHaveBeenCalledWith({ search: "p" });
  });

  it("apagar a busca inteira limpa a chave", async () => {
    const onTextChange = vi.fn();
    render(
      <Filters
        fields={[TEXT_FIELD]}
        values={{ search: "p" }}
        onChange={vi.fn()}
        onTextChange={onTextChange}
      />
    );

    await userEvent.click(screen.getByText("Filtros (1)"));
    await userEvent.clear(
      within(panel()).getByPlaceholderText("Razão social ou nome fantasia")
    );

    // String vazia não é "buscar por nada": é filtro nenhum.
    expect(onTextChange).toHaveBeenCalledWith("search", undefined);
  });

  it("fecha ao clicar em Fechar", async () => {
    render(<Filters fields={FIELDS} values={{}} onChange={vi.fn()} />);
    await userEvent.click(screen.getByText("Filtros"));
    await userEvent.click(within(panel()).getByText("Fechar"));
    await waitFor(() => expect(panel()).toBeNull());
  });
});
