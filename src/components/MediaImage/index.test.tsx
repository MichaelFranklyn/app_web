import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaImage } from "./index";

describe("MediaImage", () => {
  it("cobre a moldura por padrão e carrega sem travar a página", () => {
    render(<MediaImage src="/a.png" alt="Foto" />);
    const img = screen.getByAltText("Foto");
    expect(img).toHaveClass("object-cover", "h-full", "w-full");
    expect(img).toHaveAttribute("decoding", "async");
  });

  it("logo sai com altura fixa e a largura da proporção", () => {
    render(<MediaImage src="/logo.png" alt="Logo" fit="logo" />);
    expect(screen.getByAltText("Logo")).toHaveClass("h-[56px]", "max-w-full");
  });
});

describe("MediaImage — falha ao carregar", () => {
  it("mostra o fallback no lugar da imagem quebrada", () => {
    render(
      <MediaImage src="/sumiu.png" alt="Logo" fallback={<p>Sem logo</p>} />
    );
    fireEvent.error(screen.getByAltText("Logo"));
    expect(screen.queryByAltText("Logo")).toBeNull();
    expect(screen.getByText("Sem logo")).toBeInTheDocument();
  });

  it("sem fallback mantém a imagem (o navegador mostra o alt)", () => {
    render(<MediaImage src="/sumiu.png" alt="Logo" />);
    fireEvent.error(screen.getByAltText("Logo"));
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });
});
