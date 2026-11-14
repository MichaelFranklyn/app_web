import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./index";

describe("Avatar", () => {
  it("mostra a foto com o nome no alt", () => {
    render(<Avatar src="/a.png" alt="Menezes Rep." initials="MR" />);
    expect(screen.getByRole("img", { name: "Menezes Rep." })).toHaveAttribute(
      "src",
      "/a.png"
    );
  });

  it("foto quebrada cai nas iniciais, ainda com o nome", () => {
    const { container } = render(
      <Avatar src="/sumiu.png" alt="Menezes Rep." initials="MR" />
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Menezes Rep." })).toHaveTextContent(
      "MR"
    );
  });

  it("trocar a foto depois de uma falha volta a tentar", () => {
    const { container, rerender } = render(
      <Avatar src="/sumiu.png" alt="X" initials="X" />
    );
    fireEvent.error(container.querySelector("img")!);
    rerender(<Avatar src="/nova.png" alt="X" initials="X" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/nova.png");
  });

  it("sem nome a imagem é decorativa, nunca 'Avatar'", () => {
    const { container } = render(<Avatar src="/a.png" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
