export interface Extreme {
  store: Record<string, Function> | null;
  use: (store: Record<string, Function>) => void;
}

export const extreme: Extreme = {
  store: null,
  use: (store: Record<string, Function>) => {
    extreme.store = store;
  },
};
