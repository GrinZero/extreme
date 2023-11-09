export const useState = <T = unknown>(value: T) => {
  let _value = value;
  const set = new Set<(v?: T) => void>();
  const getValue = (fn?: (v?: T) => void) => {
    if (fn) {
      set.add(fn);
    }
    return _value;
  };
  const setValue = (value: T) => {
    _value = value;
    set.forEach((fn) => fn(_value));
  };
  return [getValue, setValue] as const;
};
