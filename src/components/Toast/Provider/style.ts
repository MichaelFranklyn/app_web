export const toastStyles = {
  // Escala em px: o `bottom-4 right-4 gap-2` antigo dava 4px da borda e 2px
  // entre avisos. No celular a pilha ocupa a largura (16px de cada lado).
  container:
    "fixed right-16 bottom-16 left-16 z-[9999] flex flex-col gap-8 pointer-events-none tablet:left-auto tablet:w-[360px]",
  // Sem faixa lateral (14/11/2026): o tom do aviso vem só do ícone tingido.
  item: "pointer-events-auto relative flex items-start gap-10 overflow-hidden rounded-(--r-lg) border border-(--border) bg-(--bg2) py-10 pr-8 pl-10 text-body-sm shadow-(--shadow-lg) animate-toast-in data-[leaving]:animate-toast-out",
  icon: "grid size-[28px] shrink-0 place-items-center rounded-full bg-current/12",
  content: "flex min-h-[28px] min-w-0 flex-1 flex-col justify-center",
  description: "mt-[2px] leading-snug",
  close: "-my-2 shrink-0",
};
