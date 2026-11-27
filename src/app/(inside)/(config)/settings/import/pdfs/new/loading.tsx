import { PAGE_HEADING } from "@/utils/modules";
import { SettingsPageSkeleton } from "../../../_components/SettingsPageSkeleton";

/** Confere papel e passos no servidor antes de abrir o assistente. */
export default function Loading() {
  return <SettingsPageSkeleton icon={PAGE_HEADING.import.icon} />;
}
