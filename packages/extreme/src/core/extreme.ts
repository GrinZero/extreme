import { render, TemplateProps } from "./render";

export interface Extreme {
  store: Record<string, Function>;
  use: (store: Record<string, Function>) => void;
}

export const extreme: Extreme = {
  store: {},
  use: (store: Record<string, Function>) => {
    extreme.store = store;
  },
};

type Fiber = {
  mount?: Function | null;
};
let currentFiber: Fiber = {
  mount: null,
};
const resetCurrentFiber = () => {
  currentFiber = {
    mount: null,
  };
};

export const useMount = (fn: Function) => {
  currentFiber.mount = fn;
};

export type ExtremeRenderFn = (
  props?: Record<any, unknown>
) => TemplateProps & {
  template: string;
};

export type ExtremeComponent = {
  (element: HTMLElement, props?: Record<any, unknown>, replace?: boolean): void;
  displayName: string;
};

export const createComponent = (name: string, component: ExtremeRenderFn) => {
  const fn: ExtremeComponent = (
    element: HTMLElement,
    props?: Record<any, unknown>,
    replace: boolean = true
  ) => {
    const result = component(props);
    render(element, result.template, result, replace);
    currentFiber.mount?.();
    resetCurrentFiber();
  };
  fn.displayName = name;
  if (extreme.store[name]) {
    throw new Error(`Component ${name} already exists`);
  }
  extreme.store[name] = fn;
  return fn;
};
