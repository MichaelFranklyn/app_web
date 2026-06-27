import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { DELETE_VISIT_SCHEDULE_ITEM_MUTATION } from "./gql";
import { DeleteVisitModal } from "./index";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const deleteMock = (status: boolean): Mocks => [
  {
    request: {
      query: DELETE_VISIT_SCHEDULE_ITEM_MUTATION,
      variables: { id: "v1" },
    },
    result: {
      data: { deleteVisitScheduleItem: { status, message: "msg" } },
    },
  },
];

const renderModal = (
  mocks: Mocks,
  handlers: Pick<
    ComponentProps<typeof DeleteVisitModal>,
    "onDeleted" | "onRemoveOptimistic" | "onCommit" | "onRollback"
  >
) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <DeleteVisitModal
          visitId="v1"
          visitLabel="Segunda-feira 14h"
          {...handlers}
        />
      </MockedProvider>
    </Toast.ToastProvider>
  );

describe("DeleteVisitModal", () => {
  it("remove otimista no clique e dá commit após o sucesso da mutation", async () => {
    const handlers = {
      onDeleted: vi.fn(),
      onRemoveOptimistic: vi.fn(),
      onCommit: vi.fn(),
      onRollback: vi.fn(),
    };
    renderModal(deleteMock(true), handlers);

    // Opens modal via trigger button
    await userEvent.click(
      await screen.findByRole("button", { name: "Remover visita" })
    );

    // Confirm button appears in the modal
    await userEvent.click(
      await screen.findByRole("button", { name: "Remover" })
    );

    // onRemoveOptimistic is called synchronously before mutation
    expect(handlers.onRemoveOptimistic).toHaveBeenCalledWith("v1");

    // Success → commit + onDeleted, no rollback
    await waitFor(() => expect(handlers.onCommit).toHaveBeenCalledTimes(1));
    expect(handlers.onDeleted).toHaveBeenCalledTimes(1);
    expect(handlers.onRollback).not.toHaveBeenCalled();
  });

  it("faz rollback quando a mutation falha", async () => {
    const handlers = {
      onDeleted: vi.fn(),
      onRemoveOptimistic: vi.fn(),
      onCommit: vi.fn(),
      onRollback: vi.fn(),
    };
    renderModal(deleteMock(false), handlers);

    await userEvent.click(
      await screen.findByRole("button", { name: "Remover visita" })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Remover" })
    );

    expect(handlers.onRemoveOptimistic).toHaveBeenCalledWith("v1");
    await waitFor(() => expect(handlers.onRollback).toHaveBeenCalledTimes(1));
    expect(handlers.onCommit).not.toHaveBeenCalled();
    expect(handlers.onDeleted).not.toHaveBeenCalled();
  });
});
