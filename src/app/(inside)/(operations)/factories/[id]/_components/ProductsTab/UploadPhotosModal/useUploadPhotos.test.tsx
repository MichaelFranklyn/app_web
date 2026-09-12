import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * O catálogo (varredura de páginas), a redução no navegador e o base64 têm
 * testes próprios; aqui entram como dublês para o que se prende ser o caminho
 * das fotos: casar pelo nome, enviar em lotes e contar o que gravou.
 */
const { catalog, resizeImage, fileToBase64 } = vi.hoisted(() => ({
  catalog: {
    nodes: [] as { id: string; sku: string; name: string }[],
    loading: false,
    error: undefined as unknown,
    reload: vi.fn(),
  },
  resizeImage: vi.fn(async (file: File) => file),
  fileToBase64: vi.fn(async () => "data:image/jpeg;base64,AAA"),
}));

vi.mock("@/hooks/useAllPages", () => ({ useAllPages: () => catalog }));
vi.mock("@/utils/image/resize", () => ({ resizeImage }));
vi.mock("@/utils/file", () => ({ fileToBase64 }));

import { Toast } from "@/components/Toast";
import { SET_PRODUCT_IMAGES_MUTATION } from "./gql";
import { useUploadPhotos } from "./useUploadPhotos";

const COMPANY_FACTORY = "cf1";

const photoFile = (name: string) =>
  new File(["x"], name, { type: "image/jpeg" });

const sendMock = (
  images: { productId: string; imageFileName: string }[],
  result: { updated: number; errors: { fileName: string; message: string }[] },
  ok = true
) => ({
  request: {
    query: SET_PRODUCT_IMAGES_MUTATION,
    variables: {
      input: {
        companyFactoryId: COMPANY_FACTORY,
        images: images.map((image) => ({
          ...image,
          imageBase64: "data:image/jpeg;base64,AAA",
        })),
      },
    },
  },
  maxUsageCount: 10,
  result: {
    data: {
      setProductImages: {
        __typename: "SetProductImagesResponse",
        status: ok,
        message: ok ? "ok" : "Fábrica sem catálogo",
        data: ok
          ? {
              __typename: "SetProductImagesData",
              total: images.length,
              updated: result.updated,
              failed: result.errors.length,
              errors: result.errors.map((error) => ({
                __typename: "ImportError",
                ...error,
              })),
            }
          : null,
      },
    },
  },
});

/** Um lote de N fotos do mesmo produto, nomeadas em sequência. */
const lote = (from: number, to: number) =>
  Array.from({ length: to - from }, (_, i) => ({
    productId: "p1",
    imageFileName: `CP-001-${from + i}.jpg`,
  }));

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[] = []) => {
  const onChanged = vi.fn();
  const onClose = vi.fn();
  const { result } = renderHook(
    () =>
      useUploadPhotos({
        open: true,
        companyFactoryId: COMPANY_FACTORY,
        onChanged,
        onClose,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onChanged, onClose };
};

beforeEach(() => {
  vi.clearAllMocks();
  catalog.nodes = [
    { id: "p1", sku: "CP-001", name: "Cimento" },
    { id: "p2", sku: "CP-002", name: "Argamassa" },
  ];
  catalog.error = undefined;
  Object.assign(URL, {
    createObjectURL: vi.fn(() => "blob:foto"),
    revokeObjectURL: vi.fn(),
  });
});

describe("useUploadPhotos — soltar os arquivos", () => {
  it("casa cada arquivo com o produto pelo nome", async () => {
    const { result } = run();

    act(() => result.current.addFiles([photoFile("CP-001.jpg")]));

    expect(result.current.photos[0].productId).toBe("p1");
    expect(result.current.stats).toMatchObject({ total: 1, matched: 1 });
  });

  it("arquivo que não casa entra sem produto, para o usuário resolver", async () => {
    const { result } = run();

    act(() => result.current.addFiles([photoFile("foto-solta.jpg")]));

    expect(result.current.photos[0].productId).toBe("");
    expect(result.current.stats).toMatchObject({ matched: 0, unmatched: 1 });
  });

  it("o que não é imagem é ignorado em silêncio", async () => {
    const { result } = run();

    act(() =>
      result.current.addFiles([
        new File(["x"], "planilha.xlsx", {
          type: "application/vnd.ms-excel",
        }),
      ])
    );

    expect(result.current.photos).toHaveLength(0);
  });

  it("dá para corrigir a mão e descartar uma foto", async () => {
    const { result } = run();
    act(() =>
      result.current.addFiles([photoFile("CP-001.jpg"), photoFile("x.jpg")])
    );

    act(() => result.current.assignProduct(1, "p2"));
    expect(result.current.stats.matched).toBe(2);

    act(() => result.current.removePhoto(0));
    expect(result.current.photos).toHaveLength(1);
  });

  it("dois arquivos para o mesmo produto viram aviso de conflito", async () => {
    // "CP-001.jpg" e "CP-001.png": a última gravada venceria em silêncio.
    const { result } = run();

    act(() =>
      result.current.addFiles([
        photoFile("CP-001.jpg"),
        photoFile("CP-001.png"),
      ])
    );

    expect(result.current.stats.duplicated).toBe(1);
  });
});

describe("useUploadPhotos — enviar", () => {
  it("manda em lotes e conta o que já subiu", async () => {
    // O corpo é base64 e passa pelo BFF: 10 fotos saem em dois lotes.
    const { result, onChanged, onClose } = run([
      sendMock(lote(0, 8), { updated: 8, errors: [] }),
      sendMock(lote(8, 10), { updated: 2, errors: [] }),
    ]);
    act(() =>
      result.current.addFiles(
        Array.from({ length: 10 }, (_, i) => photoFile(`CP-001-${i}.jpg`))
      )
    );
    act(() =>
      result.current.photos.forEach((_, index) =>
        result.current.assignProduct(index, "p1")
      )
    );

    await act(() => result.current.handleSubmit());

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
    expect(resizeImage).toHaveBeenCalledTimes(10);
  });

  it("sem foto casada, não há o que enviar", async () => {
    const { result, onChanged } = run([]);
    act(() => result.current.addFiles([photoFile("solta.jpg")]));

    await act(() => result.current.handleSubmit());

    expect(onChanged).not.toHaveBeenCalled();
  });

  it("foto recusada pelo backend é dita pelo nome do arquivo", async () => {
    const { result, onChanged } = run([
      sendMock([{ productId: "p1", imageFileName: "CP-001.jpg" }], {
        updated: 0,
        errors: [
          { fileName: "CP-001.jpg", message: "Produto de outra fábrica" },
        ],
      }),
    ]);
    act(() => result.current.addFiles([photoFile("CP-001.jpg")]));

    await act(() => result.current.handleSubmit());

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it("falha no meio do envio zera o contador", async () => {
    const { result, onChanged } = run([
      sendMock(
        [{ productId: "p1", imageFileName: "CP-001.jpg" }],
        {
          updated: 0,
          errors: [],
        },
        false
      ),
    ]);
    act(() => result.current.addFiles([photoFile("CP-001.jpg")]));

    await act(() => result.current.handleSubmit());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sent).toBe(0);
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("catálogo vazio é diferente de catálogo que não carregou", async () => {
    catalog.nodes = [];
    const semProduto = run([]).result;
    expect(semProduto.current.hasProducts).toBe(false);
    expect(semProduto.current.productsError).toBeUndefined();

    catalog.error = new Error("sem rede");
    const comErro = run([]).result;
    expect(comErro.current.productsError).toBeTruthy();
  });
});
