import { Plus } from "lucide-react";
import { RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";

import type { SelectOption } from "./InputSelect";
import { InputCheckbox } from "./InputCheckbox";
import { selectStyles } from "./styles";

interface SelectDropdownProps {
  dropdownRef: RefObject<HTMLDivElement | null>;
  position: "absolute" | "fixed";
  pos: { top: number; left: number; width: number };
  portalTarget: Element;
  variant: "single" | "multi";
  options: SelectOption[];
  isSelected: (option: SelectOption) => boolean;
  areAllFilteredSelected: boolean;
  onSelectAll: (e: React.MouseEvent) => void;
  onSelectOption: (option: SelectOption, e: React.MouseEvent) => void;
  showCreateOption: boolean;
  inputValue: string;
  isCreating: boolean;
  onCreateNew: (e: React.MouseEvent) => void;
}

/** Painel flutuante do InputSelect (opções, selecionar-todos e criar). */
export const SelectDropdown = ({
  dropdownRef,
  position,
  pos,
  portalTarget,
  variant,
  options,
  isSelected,
  areAllFilteredSelected,
  onSelectAll,
  onSelectOption,
  showCreateOption,
  inputValue,
  isCreating,
  onCreateNew,
}: SelectDropdownProps) =>
  createPortal(
    <div
      ref={dropdownRef}
      data-select-dropdown
      className={selectStyles.overlay}
      style={{ position, top: pos.top, left: pos.left, width: pos.width }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {variant === "multi" && options.length > 0 && (
        <div
          className={selectStyles.optionBox}
          data-selected={areAllFilteredSelected}
          onClick={onSelectAll}
        >
          <div className={selectStyles.optionCheckboxWrap}>
            <InputCheckbox
              checked={areAllFilteredSelected}
              readOnly
              tabIndex={-1}
            />
            <span className="font-medium">Selecionar todos</span>
          </div>
        </div>
      )}

      {options.map((option) => (
        <div
          key={option.value}
          className={selectStyles.optionBox}
          data-selected={isSelected(option)}
          onClick={(e) => onSelectOption(option, e)}
        >
          <div className={selectStyles.optionCheckboxWrap}>
            {variant === "multi" && (
              <InputCheckbox
                checked={isSelected(option)}
                readOnly
                tabIndex={-1}
              />
            )}
            {option.startIcon && (
              <div className="text-(--muted)">{option.startIcon}</div>
            )}
            <span className="truncate">{option.label}</span>
            {option.endIcon && (
              <div className="ml-auto text-(--muted)">{option.endIcon}</div>
            )}
          </div>
        </div>
      ))}

      {options.length === 0 && !showCreateOption && (
        <div className={selectStyles.warningText}>
          Nenhum resultado encontrado
        </div>
      )}

      {showCreateOption && (
        <div className="flex flex-col items-start gap-6 p-2">
          <Title variant="caption" color="muted" className="w-full">
            Não encontrou o que procura?
          </Title>
          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="xs"
            noUppercase
            loading={isCreating}
            disabled={inputValue.trim().length === 0}
            onClick={onCreateNew}
          >
            <Button.Icon icon={Plus} />
            <Button.Title>
              {inputValue.trim().length > 0
                ? `Criar "${inputValue}"`
                : "Escreva e adicione"}
            </Button.Title>
          </Button.Root>
        </div>
      )}
    </div>,
    portalTarget
  );
