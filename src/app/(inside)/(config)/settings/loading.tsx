import { SettingsPageSkeleton } from "./_components/SettingsPageSkeleton";

/**
 * `/settings` só redireciona (conforme o papel) e o layout já pinta o menu da
 * área: sem este limite, o conteúdo ficava vazio até o redirect chegar. As
 * telas com `loading.tsx` próprio usam o delas.
 */
export default function SettingsLoading() {
  return <SettingsPageSkeleton />;
}
