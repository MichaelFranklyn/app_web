import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UPDATE_ORDER_FROM_CLIENT_MUTATION } from "./gql";
import { EditOrderModal } from "./index";

const renderModal = (props: Partial<Parameters<typeof EditOrderModal>[0]>) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={[]}>
        <EditOrderModal
          orderId="o1"
          initialNotes="obs antiga"
          mutation={UPDATE_ORDER_FROM_CLIENT_MUTATION}
          {...props}
        />
      </MockedProvider>
    </Toast.ToastProvider>
  );

describe("EditOrderModal", () => {
  it("sem controle externo, traz o próprio botão Editar", () => {
    renderModal({});

    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("abre pelo próprio gatilho", async () => {
    renderModal({});

    await userEvent.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByText("Editar pedido")).toBeInTheDocument();
  });

  /**
   * Controlado: o gatilho vive fora — tipicamente numa tabela dentro de OUTRO
   * modal, que fecha antes deste abrir. Renderizar um trigger aqui era o que
   * empilhava dois modais e deixava o usuário sem saber qual estava fechando.
   */
  it("controlado, não renderiza gatilho próprio", () => {
    renderModal({ open: false, onOpenChange: vi.fn() });

    expect(
      screen.queryByRole("button", { name: /editar/i })
    ).not.toBeInTheDocument();
  });

  it("controlado com open, já abre o formulário", () => {
    renderModal({ open: true, onOpenChange: vi.fn() });

    expect(screen.getByText("Editar pedido")).toBeInTheDocument();
  });

  it("controlado, avisa o pai ao cancelar em vez de fechar sozinho", async () => {
    const onOpenChange = vi.fn();
    renderModal({ open: true, onOpenChange });

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
