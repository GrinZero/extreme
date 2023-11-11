import type { GetState } from "./useState";

export const useEffect = (fn: Function, deps: GetState[]) => {
  deps.forEach((dep) => {
    dep((v) => {
      fn(v);
    });
  });
};
