import type { Metadata } from "next";
import PrivacyContent from "./content";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como o Girus trata dados pessoais: o que é coletado, para quê, com quem é compartilhado, onde fica armazenado e quais são os direitos do titular.",
  alternates: { canonical: "/privacidade" },
};

const Page = () => {
  return <PrivacyContent />;
};

export default Page;
