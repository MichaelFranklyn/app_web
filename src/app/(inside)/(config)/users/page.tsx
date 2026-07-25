import { redirect } from "next/navigation";

// A lista de pessoas passou a morar sob as configurações (/settings/users, item
// "Pessoas" na sidebar). Mantido como atalho para não dar 404 em link salvo,
// como já se faz com /sellers e /profile.
const Page = () => redirect("/settings/users");

export default Page;
