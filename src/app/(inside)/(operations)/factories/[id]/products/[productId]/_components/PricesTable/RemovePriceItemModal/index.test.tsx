import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { DELETE_PRICE_LIST_ITEM_MUTATION } from "../gql";
import { RemovePriceItemModal } from "./index";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const deleteMock = (status: boolean): Mocks => [
  {
    request: {
      query: DELETE_PRICE_LIST_ITEM_MUTATION,
      variables: { id: "pi1" },
    },
    result: { data: { deletePriceListItem: { status, message: "msg" } } },
  },
];

const renderModal = (
  mocks: Mocks,
  handlers: Pick<
    ComponentProps<typeof RemovePriceItemModal>,
    "onRemoved" | "onRemoveOptimistic" | "onCommit" | "onRollback"
  >
) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <RemovePriceItemModal
          priceItemId="pi1"
          label="Nível Ouro"
          open
          onOpenChange={vi.fn()}
          {...handlers}
        />
      </MockedProvider>
    </Toast.ToastProvider>
  );

describe("RemovePriceItemModal", () => {
  it("remove otimista no clique e dá commit após o sucesso da mutation", async () => {
    const handlers = {
      onRemoved: vi.fn(),
      onRemoveOptimistic: vi.fn(),
      onCommit: vi.fn(),
      onRollback: vi.fn(),
    };
    renderModal(deleteMock(true), handlers);

    await userEvent.click(
      await screen.findByRole("button", { name: "Remover" })
    );

    // onBeforeConfirm é síncrono → remoção otimista imediata.
    expect(handlers.onRemoveOptimistic).toHaveBeenCalledWith("pi1");

    // Sucesso da mutation → commit + onRemoved, sem rollback.
    await waitFor(() => expect(handlers.onCommit).toHaveBeenCalledTimes(1));
    expect(handlers.onRemoved).toHaveBeenCalledTimes(1);
    expect(handlers.onRollback).not.toHaveBeenCalled();
  });

  it("faz rollback quando a mutation falha", async () => {
    const handlers = {
      onRemoved: vi.fn(),
      onRemoveOptimistic: vi.fn(),
      onCommit: vi.fn(),
      onRollback: vi.fn(),
    };
    renderModal(deleteMock(false), handlers);

    await userEvent.click(
      await screen.findByRole("button", { name: "Remover" })
    );

    expect(handlers.onRemoveOptimistic).toHaveBeenCalledWith("pi1");
    await waitFor(() => expect(handlers.onRollback).toHaveBeenCalledTimes(1));
    expect(handlers.onCommit).not.toHaveBeenCalled();
    expect(handlers.onRemoved).not.toHaveBeenCalled();
  });
});
