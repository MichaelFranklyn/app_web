import { ImageResponse } from "next/og";

/**
 * Imagem do card de link da landing — o que aparece quando alguém cola o
 * endereço no WhatsApp, no LinkedIn ou no grupo da equipe.
 *
 * Gerada no build em vez de ser um PNG no `public/`: assim o texto acompanha a
 * copy do site sem depender de alguém reabrir um arquivo de design. Sem fontes
 * customizadas de propósito — carregar a Oswald aqui exigiria ler o `.woff2` a
 * cada build para ganhar pouco num quadro de 1200×630.
 *
 * As cores são as do tema (`--bg`, `--text`, `--amber`), mas escritas em hexa
 * literal: isto não roda no navegador, então não há CSS de onde ler a variável.
 */
export const alt = "Girus — Plataforma de Gestão Comercial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#f5f4f0",
        padding: "80px",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "8px",
          backgroundColor: "#c97f0a",
          marginBottom: "40px",
        }}
      />

      <div
        style={{
          fontSize: "88px",
          fontWeight: 700,
          color: "#1a1a16",
          letterSpacing: "-2px",
        }}
      >
        Girus
      </div>

      <div
        style={{
          fontSize: "40px",
          color: "#3d3d36",
          marginTop: "16px",
          maxWidth: "820px",
          lineHeight: 1.4,
        }}
      >
        Pedidos, clientes, comissões e a rota do dia — o comercial em um lugar
        só.
      </div>
    </div>,
    size
  );
}
