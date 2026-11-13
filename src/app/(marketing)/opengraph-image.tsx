import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/**
 * Imagem do card de link da landing — o que aparece quando alguém cola o
 * endereço no WhatsApp, no LinkedIn ou no grupo da equipe.
 *
 * Gerada no build em vez de ser um PNG no `public/`: assim o texto acompanha a
 * copy do site sem depender de alguém reabrir um arquivo de design. A marca é o
 * SVG de `public/horizontal_logo.svg` (texto já em curvas, então não precisa de
 * fonte); o restante usa a fonte padrão de propósito — carregar a Oswald aqui
 * exigiria ler o `.woff2` a cada build para ganhar pouco num quadro de 1200×630.
 *
 * As cores são as do tema (`--bg`, `--text`, `--amber`), mas escritas em hexa
 * literal: isto não roda no navegador, então não há CSS de onde ler a variável.
 */
export const alt = "Itinus — Plataforma de Gestão Comercial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Proporção do viewBox da marca horizontal (361×90).
const LOGO_W = 480;
const LOGO_H = 120;

export default async function OpengraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public", "horizontal_logo.svg")
  );
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

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
      <img src={logoSrc} alt="" width={LOGO_W} height={LOGO_H} />

      <div
        style={{
          fontSize: "40px",
          color: "#3d3d36",
          marginTop: "48px",
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
