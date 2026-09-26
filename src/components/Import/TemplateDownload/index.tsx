import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Download } from "lucide-react";

interface TemplateDownloadProps {
  title?: string;
  description?: string;
  onDownload: () => void;
}

/** A oferta do modelo de planilha, no topo de todo modal de importação. */
export function TemplateDownload({
  title = "Não tem o modelo?",
  description = "Baixe a planilha de exemplo, preencha e envie de volta.",
  onDownload,
}: TemplateDownloadProps) {
  return (
    <Card.Root inset>
      <Card.Body
        padding="sm"
        className="flex-row items-center justify-between gap-12"
      >
        <div className="flex flex-col gap-2">
          <Title variant="body-sm" weight="medium">
            {title}
          </Title>
          <Title variant="body-xs" color="muted">
            {description}
          </Title>
        </div>
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          onClick={onDownload}
        >
          <Button.Icon icon={Download} />
          <Button.Title>Baixar modelo</Button.Title>
        </Button.Root>
      </Card.Body>
    </Card.Root>
  );
}
