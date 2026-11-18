import { describe, expect, it } from "vitest";
import { shouldRedirectToSetup } from "./utils";

describe("shouldRedirectToSetup", () => {
  const base = { pending: true, pathname: "/dashboard", alreadyShown: false };

  it("leva à configuração na primeira tela da entrada", () => {
    expect(shouldRedirectToSetup(base)).toBe(true);
  });

  it("não leva quando a configuração foi concluída", () => {
    expect(shouldRedirectToSetup({ ...base, pending: false })).toBe(false);
  });

  it("leva só uma vez por entrada", () => {
    expect(shouldRedirectToSetup({ ...base, alreadyShown: true })).toBe(false);
  });

  it("não redireciona quem já está na configuração ou numa sub-tela dela", () => {
    expect(
      shouldRedirectToSetup({ ...base, pathname: "/settings/import" })
    ).toBe(false);
    expect(
      shouldRedirectToSetup({ ...base, pathname: "/settings/import/orders" })
    ).toBe(false);
  });

  it("não confunde rota com prefixo parecido", () => {
    expect(
      shouldRedirectToSetup({ ...base, pathname: "/settings/imports-log" })
    ).toBe(true);
  });
});
