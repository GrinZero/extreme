export type GetState<T = unknown> = (fn?: (v?: T, old?: T) => void) => T;
export type SetState<T = unknown> = (v: T) => void;

export const useState = <T = unknown>(value: T) => {
  let _value = value;
  const set = new Set<(v?: T, old?: T) => void>();
  const getValue: GetState<T> = (fn) => {
    if (fn) {
      set.add(fn);
    }
    return _value;
  };
  const setValue: SetState<T> = (value: T) => {
    if (_value === value) return;
    const oldV = _value;
    _value = value;
    set.forEach((fn) => {
      if (requestIdleCallback) {
        requestIdleCallback(() => fn(_value, oldV));
      } else {
        fn(_value, oldV);
      }
    });
  };
  return [getValue, setValue] as const;
};
