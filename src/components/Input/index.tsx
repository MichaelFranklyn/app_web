import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputHint } from "./Hint";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputControl } from "./Control";
import { InputText } from "./InputText";
import { InputEmail } from "./InputEmail";
import { InputTextarea } from "./InputTextarea";
import { InputPassword } from "./InputPassword";
import { InputNumber } from "./InputNumber";
import { InputCheckbox } from "./InputCheckbox";
import { InputRadio } from "./InputRadio";
import { InputToggle } from "./InputToggle";
import { InputMask } from "./InputMask";
import { InputSelect } from "./InputSelect";
import { InputDate } from "./InputDate";
import { InputArchive } from "./InputArchive";
import { InputSearch } from "./InputSearch";

export {
  InputRoot,
  InputLabel,
  InputHint,
  InputGroup,
  InputAddon,
  InputControl,
  InputText,
  InputEmail,
  InputTextarea,
  InputPassword,
  InputNumber,
  InputCheckbox,
  InputRadio,
  InputToggle,
  InputMask,
  InputSelect,
  InputDate,
  InputArchive,
  InputSearch,
};

// Export the compound component directly if someone prefers using it explicitly
export const Input = {
  Root: InputRoot,
  Label: InputLabel,
  Hint: InputHint,
  Group: InputGroup,
  Addon: InputAddon,
  Control: InputControl,
  Text: InputText,
  Email: InputEmail,
  Textarea: InputTextarea,
  Password: InputPassword,
  Number: InputNumber,
  Checkbox: InputCheckbox,
  Radio: InputRadio,
  Toggle: InputToggle,
  Mask: InputMask,
  Select: InputSelect,
  Date: InputDate,
  Archive: InputArchive,
  Search: InputSearch,
};
