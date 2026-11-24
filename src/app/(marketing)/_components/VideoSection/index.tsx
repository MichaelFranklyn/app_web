import { ICON_SIZE } from "@/components/Icon";
import { Title } from "@/components/Title";
import { Play } from "lucide-react";
import Image from "next/image";
import { Section } from "../Section";
import { ROUTINE_VIDEO } from "./utils";

/**
 * O vídeo narrado da rotina (14/11/2026). O espaço já existe na página para o
 * layout não mudar quando o vídeo chegar; até lá é uma moldura com o selo
 * "Em breve" — sem botão de play clicável, que prometeria algo que não toca.
 *
 * `<video>` nativo, sem player de terceiro: a página continua de servidor e
 * sem JavaScript. `preload="none"` para o vídeo não pesar na primeira carga.
 */
export function VideoSection() {
  const { src, captions, poster } = ROUTINE_VIDEO;

  return (
    <Section
      id="video"
      tone="raised"
      className="flex flex-col items-center gap-32"
    >
      <div className="flex max-w-[640px] flex-col items-center gap-12 text-center">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          A semana do vendedor, tela a tela
        </Title>

        <Title variant="body-md" color="secondary">
          Da escolha dos clientes na segunda-feira à última visita da sexta: um
          passeio narrado pela rotina, do jeito que a equipe usa.
        </Title>
      </div>

      <div className="relative aspect-video w-full max-w-[960px] overflow-hidden rounded-(--r-lg) border border-(--border) bg-(--color-text) shadow-(--shadow-lg)">
        {src ? (
          <video
            controls
            preload="none"
            poster={poster}
            className="size-full object-cover"
          >
            <source src={src} type="video/mp4" />
            {captions && (
              <track
                kind="captions"
                src={captions}
                srcLang="pt-BR"
                label="Português"
                default
              />
            )}
          </video>
        ) : (
          <>
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1008px) 960px, 100vw"
              className="object-cover object-top opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-16 p-24 text-center">
              <span
                aria-hidden
                className="tablet:size-[80px] flex size-[56px] items-center justify-center rounded-full border-2 border-(--bg2)/70 bg-(--bg2)/15"
              >
                <Play
                  size={ICON_SIZE.xl}
                  className="ml-4 fill-(--bg2) stroke-(--bg2)"
                />
              </span>
              <span className="rounded-full bg-(--bg2) px-12 py-4">
                <Title as="span" variant="label" color="cyan">
                  Em breve
                </Title>
              </span>
              <Title
                variant="body-sm"
                color="inherit"
                className="max-w-[40ch] text-(--bg2)"
              >
                O vídeo está em produção. Enquanto isso, o teste grátis mostra
                tudo isso com os seus próprios clientes.
              </Title>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
