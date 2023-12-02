import type { GetState } from "./useState";

import { idleCallback } from "./useState";

export const useEffect = (fn: Function, deps: GetState[]) => {
  for (const dep of deps) {
    dep((v) => idleCallback(() => fn(v)));
  }
};
