import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MissedVisitModal } from "./index";

const setup = (contactType: "IN_PERSON" | "REMOTE" = "IN_PERSON") => {
  const props = {
    clientName: "Joni Materiais",
    contactType,
    open: true,
    onOpenChange: vi.fn(),
    onReason: vi.fn(),
    onReschedule: vi.fn(),
  };
  render(<MissedVisitModal {...props} />);
  return props;
};

describe("MissedVisitModal", () => {
  it("um toque em 'Não estava' registra o motivo e fecha", async () => {
    const props = setup();
    await userEvent.click(screen.getByText("Não estava"));
    expect(props.onReason).toHaveBeenCalledWith("CLIENT_ABSENT");
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("'Não deu tempo' devolve o cliente ao motor", async () => {
    const props = setup();
    await userEvent.click(screen.getByText("Não deu tempo"));
    expect(props.onReason).toHaveBeenCalledWith("NO_TIME");
  });

  it("'Remarcar' troca de modal sem registrar motivo", async () => {
    const props = setup();
    await userEvent.click(screen.getByText("Remarcar"));
    expect(props.onReschedule).toHaveBeenCalled();
    expect(props.onReason).not.toHaveBeenCalled();
  });

  it("na ligação, o motivo fala de quem não atendeu", () => {
    setup("REMOTE");
    expect(screen.getByText("Não atendeu")).toBeTruthy();
    expect(screen.queryByText("Não estava")).toBeNull();
  });
});
