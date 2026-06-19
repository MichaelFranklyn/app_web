import { TopbarActions } from "./Actions";
import { TopbarBreadcrumb } from "./Breadcrumb";
import { TopbarNotification } from "./Notification";
import { TopbarRoot } from "./Root";
import { TopbarSeparator } from "./Separator";
import { TopbarStatus } from "./Status";

export const Topbar = Object.assign(TopbarRoot, {
  Root: TopbarRoot,
  Breadcrumb: TopbarBreadcrumb,
  Actions: TopbarActions,
  Status: TopbarStatus,
  Notification: TopbarNotification,
  Separator: TopbarSeparator,
});
