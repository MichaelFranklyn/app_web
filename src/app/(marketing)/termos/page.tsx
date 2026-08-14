import type { Metadata } from "next";
import TermsContent from "./content";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "As regras de uso do Girus: conta, planos e limites, período de teste, propriedade dos dados, disponibilidade e encerramento.",
  alternates: { canonical: "/termos" },
};

const Page = () => {
  return <TermsContent />;
};

export default Page;
