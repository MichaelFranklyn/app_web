import { MockedProvider } from "@apollo/client/testing/react";
import { ReactNode } from "react";

import { Toast } from "@/components/Toast";

/** Provider dos testes da página: Apollo com mocks + toasts. */
export const withProviders = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};
