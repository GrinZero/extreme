export type GetState<T = unknown> = (fn?: (v?: T) => void) => T;
export type SetState<T = unknown> = (v: T) => void;

export const useState = <T = unknown>(value: T) => {
  let _value = value;
  const set = new Set<(v?: T) => void>();
  const getValue: GetState<T> = (fn?: (v?: T) => void) => {
    if (fn) {
      set.add(fn);
    }
    return _value;
  };
  const setValue: SetState<T> = (value: T) => {
    _value = value;
    set.forEach((fn) => fn(_value));
  };
  return [getValue, setValue] as const;
};
