// Importa o Header direto do módulo-fonte, não do barrel `@/components/Card`.
// O barrel do Table puxar o barrel inteiro do Card em tempo de avaliação criava
// uma referência cruzada que o Turbopack, no fast-refresh, resolvia às vezes como
// `undefined` ("Element type is invalid" no ClientDetailSkeleton, que usa CardHead).
import { Header } from "@/components/Card/Header";

export const CardHead = Header;
