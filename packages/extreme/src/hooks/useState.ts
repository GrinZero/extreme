export type GetState<T = unknown> = (
  fn?: (v?: T, old?: T) => void | Promise<void>
) => T;
export type SetState<T = unknown> = (v: T) => void;
import { getCurrentListener } from "../core/listener";

export const idleCallback =
  globalThis.requestIdleCallback || ((fn) => setTimeout(fn, 0));

export const useState = <T = unknown>(value: T) => {
  let _value = value;
  const set = new Set<(v?: T, old?: T) => void | Promise<void>>();
  const getValue: GetState<T> = (fn) => {
    const listener = getCurrentListener();
    if (listener) set.add(listener);
    if (fn) set.add(fn);
    return _value;
  };
  const setValue: SetState<T> = async (value: T) => {
    if (_value === value) return;
    const oldV = _value;
    _value = value;
    for (const fn of set) {
      await fn(_value, oldV);
    }
  };
  return [getValue, setValue] as const;
};
