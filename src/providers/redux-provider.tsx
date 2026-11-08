
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { stores } from "@/store/store";

type ReduxProviderProps = {
  children: ReactNode;
};

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return <Provider store={stores}>{children}</Provider>;
};

export default ReduxProvider;