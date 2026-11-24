import React from "react";
import { HeaderActionsGroup } from "../../HeaderActions";
import { CardHeaderAction } from "./Action";
import { HeaderActions } from "./Actions";
import { HeaderDescription } from "./Description";
import { HeaderEyebrow } from "./Eyebrow";
import { HeaderRoot } from "./Root";
import { HeaderTitle } from "./Title";
import { CardHeaderRootProps } from "./interface";

/**
 * Sem "use client" de propósito: o objeto composto precisa ser montado num
 * módulo comum. Exportado de um módulo client, ele chega ao server component
 * como referência opaca e `Card.Header.Title` vira `undefined` ("Element type
 * is invalid": a home do portal caiu assim em 24/11/2026). A raiz, que mede
 * as ações com refs, é client em `./Root`; cada subpeça client marca a si.
 * O embrulho abaixo existe porque a referência client (do lado do servidor)
 * recusa `Object.assign`: as subpeças penduram num componente comum.
 */
const HeaderShell = React.forwardRef<HTMLDivElement, CardHeaderRootProps>(
  (props, ref) => <HeaderRoot ref={ref} {...props} />
);
HeaderShell.displayName = "Card.Header";

export const Header = Object.assign(HeaderShell, {
  Eyebrow: HeaderEyebrow,
  Title: HeaderTitle,
  Description: HeaderDescription,
  Actions: HeaderActions,
  Action: CardHeaderAction,
  // Envolve vários headers (ex.: cards num grid) p/ decidirem o estágio juntos.
  Group: HeaderActionsGroup,
});
