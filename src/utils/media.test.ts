import { beforeEach, describe, expect, it, vi } from "vitest";

import { mediaUrl } from "./media";

describe("mediaUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "http://localhost:8000/graphql");
  });

  it("prefixa o caminho relativo com a origem da API", () => {
    expect(mediaUrl("/media/logos/abc.png")).toBe(
      "http://localhost:8000/media/logos/abc.png"
    );
  });

  it("mantém URL absoluta como está", () => {
    expect(mediaUrl("https://cdn.exemplo.com/a.png")).toBe(
      "https://cdn.exemplo.com/a.png"
    );
  });

  it("devolve undefined sem caminho", () => {
    expect(mediaUrl(null)).toBeUndefined();
    expect(mediaUrl("")).toBeUndefined();
  });

  it("devolve undefined quando a origem da API não está configurada", () => {
    vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "");
    expect(mediaUrl("/media/logos/abc.png")).toBeUndefined();
  });
});
