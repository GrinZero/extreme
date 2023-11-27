import type { GetState } from "./useState";

export const useEffect = (fn: Function, deps: GetState[]) => {
  for (const dep of deps) {
    dep((v) => fn(v));
  }
};
