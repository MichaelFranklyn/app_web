import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { importLibrary, setOptions } = vi.hoisted(() => ({
  importLibrary: vi.fn(),
  setOptions: vi.fn(),
}));
vi.mock("@googlemaps/js-api-loader", () => ({ importLibrary, setOptions }));

/**
 * A chave e a promessa de carga são SINGLETONS de módulo (o script do Google é
 * carregado uma vez por sessão, não por tela). Cada caso reimporta o módulo com
 * a env do cenário, senão o primeiro teste decidiria o resultado dos outros.
 */
const carregar = async () => {
  vi.resetModules();
  return (await import("./useGoogleMapsLoader")).useGoogleMapsLoader;
};

beforeEach(() => {
  importLibrary.mockReset().mockResolvedValue({});
  setOptions.mockReset();
});

afterEach(() => vi.unstubAllEnvs());

describe("useGoogleMapsLoader", () => {
  it("sem chave configurada, avisa qual é o problema em vez de dizer 'erro'", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "");
    const useGoogleMapsLoader = await carregar();

    const { result } = renderHook(() => useGoogleMapsLoader());

    expect(result.current).toEqual({
      ready: false,
      error: false,
      missingKey: true,
    });
    // Nem tenta a rede: a mensagem da tela é de configuração, não de falha.
    expect(importLibrary).not.toHaveBeenCalled();
  });

  it("carrega o mapa e os marcadores, e fica pronto", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "chave-de-teste");
    const useGoogleMapsLoader = await carregar();

    const { result } = renderHook(() => useGoogleMapsLoader());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.error).toBe(false);
    expect(setOptions).toHaveBeenCalledWith({
      key: "chave-de-teste",
      v: "weekly",
    });
    expect(importLibrary).toHaveBeenCalledWith("maps");
    expect(importLibrary).toHaveBeenCalledWith("marker");
  });

  it("carrega o script uma vez só, por mais telas que peçam o mapa", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "chave-de-teste");
    const useGoogleMapsLoader = await carregar();

    const primeira = renderHook(() => useGoogleMapsLoader());
    await waitFor(() => expect(primeira.result.current.ready).toBe(true));

    const segunda = renderHook(() => useGoogleMapsLoader());
    await waitFor(() => expect(segunda.result.current.ready).toBe(true));

    // duas bibliotecas, UMA carga — não duas por tela.
    expect(importLibrary).toHaveBeenCalledTimes(2);
    expect(setOptions).toHaveBeenCalledTimes(1);
  });

  it("falha de rede vira erro, não 'chave ausente'", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "chave-de-teste");
    importLibrary.mockRejectedValue(new Error("offline"));
    const useGoogleMapsLoader = await carregar();

    const { result } = renderHook(() => useGoogleMapsLoader());

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.ready).toBe(false);
    expect(result.current.missingKey).toBe(false);
  });
});
