export const toastStyles = {
  container:
    "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-[320px] w-full pointer-events-none",
  item: "pointer-events-auto bg-(--bg2) border border-(--border) rounded-(--r-lg) p-[10px] px-[14px] flex items-start gap-[8px] text-[13px] shadow-(--shadow-md) animate-in slide-in-from-right-full fade-in slide-out-to-right fade-out duration-300",
  content: "flex-1 flex flex-col min-w-0",
  title: "",
  description: "opacity-90 leading-snug mt-[2px]",
  close:
    "text-(--muted) hover:text-(--text) transition-colors shrink-0 -mt-[2px] -mr-[6px] p-1",
};
