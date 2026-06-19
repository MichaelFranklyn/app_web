import { Actions } from "./Actions";
import { Description } from "./Description";
import { Icon } from "./Icon";
import { Root } from "./Root";
import { Title } from "./Title";

export const EmptyState = Object.assign(Root, {
  Root,
  Icon,
  Title,
  Description,
  Actions,
});
