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

const generateMock = (status: boolean, message = "msg"): Mocks => [
  {
    request: {
      query: GENERATE_WEEKLY_SCHEDULE_MUTATION,
      variables: { input: { weekStart: WEEK, sellerId: "s1" } },
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

describe("RegenerateWeekButton", () => {
  it("pede confirmação antes de refazer — o rascunho atual é substituído", async () => {
    const { onRegenerated } = renderButton(generateMock(true));

    await clickRefazer();

    expect(
      screen.getByText("Refazer a rotina desta semana?")
    ).toBeInTheDocument();
    expect(onRegenerated).not.toHaveBeenCalled();
  });

  it("confirmando, gera a rotina e avisa o pai para recarregar", async () => {
    const { onRegenerated } = renderButton(generateMock(true));

    await clickRefazer();
    // O botão do modal repete o rótulo; o último é o de confirmar.
    const confirmar = screen.getAllByRole("button", {
      name: /refazer rotina/i,
    });
    await userEvent.click(confirmar[confirmar.length - 1]);

    await waitFor(() => expect(onRegenerated).toHaveBeenCalledTimes(1));
  });

  it("mutation com status false não avisa sucesso", async () => {
    const { onRegenerated } = renderButton(
      generateMock(false, "Já existe rotina CONFIRMED para esta semana.")
    );

    await clickRefazer();
    const confirmar = screen.getAllByRole("button", {
      name: /refazer rotina/i,
    });
    await userEvent.click(confirmar[confirmar.length - 1]);

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
        screen.queryByText("Refazer a rotina desta semana?")
      ).not.toBeInTheDocument()
    );
    expect(onRegenerated).not.toHaveBeenCalled();
  });
});
