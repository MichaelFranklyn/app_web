export const selectionBarStyles = {
  // Acima do conteúdo e da topbar (z-10), porém ABAIXO do modal (z-50): as
  // ações da barra abrem modais, e uma barra por cima do próprio modal que ela
  // acabou de abrir ficaria boiando sobre o escurecido. Toast (9999) e painel
  // de filtros (9998) continuam por cima, como em toda a aplicação.
  container:
    "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-16",
  bar: "pointer-events-auto flex w-full max-w-[960px] flex-wrap items-center gap-16 rounded-(--r-lg) border border-(--border) bg-(--bg2) px-16 py-12 shadow-(--shadow-md) animate-in fade-in slide-in-from-bottom-4 duration-200",
  count: "flex min-w-0 flex-col",
  actions: "flex flex-1 flex-wrap items-center justify-end gap-8",
};
