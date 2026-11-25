import { PAGE_HEADING } from "@/utils/modules";
import { SettingsPageSkeleton } from "../../_components/SettingsPageSkeleton";

/**
 * Confere o papel e os passos no servidor antes de abrir; sem este limite,
 * herdaria o esqueleto da lista de passos (`../loading.tsx`).
 */
export default function Loading() {
  return <SettingsPageSkeleton icon={PAGE_HEADING.import.icon} />;
}
