import { getRandomID } from "../core/dom-str";

export type Ref = {
  (): HTMLElement | null;
  toString(): string;
};

export const useRef = (): Ref => {
  const id = getRandomID();
  const fn = () => document.getElementById(id);
  fn.toString = () => id;
  return fn;
};
