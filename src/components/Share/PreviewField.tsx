import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

interface PreviewFieldProps {
  label: string;
  children: string;
  /** Texto de várias linhas (o corpo da mensagem): preserva as quebras. */
  multiline?: boolean;
}

/** Um campo da prévia — só leitura, no mesmo quadro do `UrlBox`. */
export function PreviewField({
  label,
  children,
  multiline = false,
}: PreviewFieldProps) {
  return (
    <div className="flex flex-col gap-6">
      <Title variant="label" color="muted">
        {label}
      </Title>
      <div
        className={cn(
          "rounded-(--r-sm) border border-(--border) bg-(--bg3) px-12 py-10",
          multiline && "max-h-[280px] overflow-y-auto"
        )}
      >
        <Title
          variant="body-sm"
          className={multiline ? "whitespace-pre-wrap" : "break-all"}
        >
          {children}
        </Title>
      </div>
    </div>
  );
}
