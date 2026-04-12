import { createContext, useContext } from 'react';

export const LayoutContext = createContext(null);

export function useLayout() {
  return useContext(LayoutContext);
}

export function useToast() {
  const ctx = useContext(LayoutContext);
  return ctx?.addToast || (() => {});
}
