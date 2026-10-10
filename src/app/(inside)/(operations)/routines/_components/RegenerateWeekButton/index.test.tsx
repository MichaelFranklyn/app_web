import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { GENERATE_WEEKLY_SCHEDULE_MUTATION } from "../../gql";
import { RegenerateWeekButton } from "./index";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const WEEK = "2026-07-27";

const generateMock = (
  status: boolean,
  message = "msg",
  reason = "DATA_CHANGED",
  reasonNote: string | null = null
): Mocks => [
  {
    request: {
      query: GENERATE_WEEKLY_SCHEDULE_MUTATION,
      variables: {
        input: { weekStart: WEEK, sellerId: "s1", reason, reasonNote },
      },
    },
    result: {
      data: {
        generateWeeklySchedule: {
          status,
          message,
          data: status ? { id: "sch-1" } : null,
        },
      },
    },
  },
];

const renderButton = (
  mocks: Mocks,
  props: Partial<ComponentProps<typeof RegenerateWeekButton>> = {}
) => {
  const onRegenerated = vi.fn();
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <RegenerateWeekButton
          weekStart={WEEK}
          sellerId="s1"
          isConfirmed={false}
          onRegenerated={onRegenerated}
          {...props}
        />
      </MockedProvider>
    </Toast.ToastProvider>
  );
  return { onRegenerated };
};

const clickRefazer = () =>
  userEvent.click(screen.getByRole("button", { name: /refazer rotina/i }));

const escolher = (motivo: RegExp) =>
  userEvent.click(screen.getByRole("radio", { name: motivo }));

// O botão do modal repete o rótulo do gatilho; o último é o de confirmar.
const botaoConfirmar = () => {
  const todos = screen.getAllByRole("button", { name: /refazer rotina/i });
  return todos[todos.length - 1];
};

describe("RegenerateWeekButton", () => {
  it("pergunta o motivo antes de refazer — sem motivo não dá para seguir", async () => {
    const { onRegenerated } = renderButton(generateMock(true));

    await clickRefazer();

    expect(
      screen.getByText("Por que refazer a rotina desta semana?")
    ).toBeInTheDocument();
    expect(botaoConfirmar()).toBeDisabled();
    expect(onRegenerated).not.toHaveBeenCalled();
  });

  it("com o motivo escolhido, refaz mandando o motivo e avisa o pai", async () => {
    const { onRegenerated } = renderButton(generateMock(true));

    await clickRefazer();
    await escolher(/entrou pedido/i);
    await userEvent.click(botaoConfirmar());

    await waitFor(() => expect(onRegenerated).toHaveBeenCalledTimes(1));
  });

  it("'Outro motivo' exige o texto, que vai junto na mutation", async () => {
    const { onRegenerated } = renderButton(
      generateMock(true, "msg", "OTHER", "cliente pediu para antecipar")
    );

    await clickRefazer();
    await escolher(/outro motivo/i);
    expect(botaoConfirmar()).toBeDisabled();

    await userEvent.type(
      screen.getByRole("textbox"),
      "cliente pediu para antecipar"
    );
    await userEvent.click(botaoConfirmar());

    await waitFor(() => expect(onRegenerated).toHaveBeenCalledTimes(1));
  });

  // Quem vai atender uma região não precisa de rotina refeita — precisa da
  // viagem. A resposta troca este modal pelo planejador, sem chamar a mutation.
  it("'vou atender uma região' leva ao planejador de viagem, sem refazer", async () => {
    const { onRegenerated } = renderButton([]);

    await clickRefazer();
    await escolher(/vou atender uma região/i);
    await userEvent.click(
      screen.getByRole("button", { name: /planejar viagem/i })
    );

    await waitFor(() =>
      expect(
        screen.queryByText("Por que refazer a rotina desta semana?")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText("Planejar viagem")).toBeInTheDocument();
    expect(onRegenerated).not.toHaveBeenCalled();
  });

  it("mutation com status false não avisa sucesso", async () => {
    const { onRegenerated } = renderButton(
      generateMock(false, "Já existe rotina CONFIRMED para esta semana.")
    );

    await clickRefazer();
    await escolher(/entrou pedido/i);
    await userEvent.click(botaoConfirmar());

    await waitFor(() =>
      expect(
        screen.getByText("Já existe rotina CONFIRMED para esta semana.")
      ).toBeInTheDocument()
    );
    expect(onRegenerated).not.toHaveBeenCalled();
  });

  it("rotina confirmada desabilita o botão — o backend recusa regerar", () => {
    renderButton(generateMock(true), { isConfirmed: true });

    expect(
      screen.getByRole("button", { name: /refazer rotina/i })
    ).toBeDisabled();
  });

  it("cancelar fecha sem gerar nada", async () => {
    const { onRegenerated } = renderButton(generateMock(true));

    await clickRefazer();
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() =>
      expect(
        screen.queryByText("Por que refazer a rotina desta semana?")
      ).not.toBeInTheDocument()
    );
    expect(onRegenerated).not.toHaveBeenCalled();
  });
});
