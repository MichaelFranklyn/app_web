import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { ButtonContext } from "./context";
import { ButtonProps } from "./interface";
import { getButtonClasses, iconPixelSizes } from "./style";

export const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      appearance = "solid",
      color = "amber",
      size = "md",
      fullWidth = false,
      loading = false,
      isIconOnly = false,
      active = false,
      noPadding = false,
      noUppercase = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <ButtonContext.Provider value={{ size, isIconOnly, loading }}>
      <button
        ref={ref}
        className={getButtonClasses({
          appearance,
          color,
          size,
          isIconOnly,
          fullWidth,
          active,
          noPadding,
          noUppercase,
          className,
        })}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <Loader2
            className="shrink-0 animate-spin"
            size={iconPixelSizes[size]}
          />
        )}
        {!loading && children}
      </button>
    </ButtonContext.Provider>
  )
);
ButtonRoot.displayName = "Button.Root";
