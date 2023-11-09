import { useID } from "./useID";

export type Ref = {
  (): HTMLElement | null;
  toString(): string;
};

export const useRef = (): Ref => {
  const id = useID();
  const fn = () => document.getElementById(id);
  fn.toString = () => id;
  return fn;
};
