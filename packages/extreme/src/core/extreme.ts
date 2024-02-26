import { render, TemplateProps } from "./render";
import { currentCell, resetCurrentCell } from "./cell";

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

export type ExtremeRenderFn<Props extends Record<any, unknown>> = (
  props: Props
) => TemplateProps & {
  template: string;
};

export type ExtremeComponent<Props extends Record<any, unknown>> = {
  (element: HTMLElement, props: Props, replace?: boolean): void;
  displayName: string;
};

export const createComponent = <Props extends Record<any, unknown>>(
  name: string,
  component: ExtremeRenderFn<Props>
) => {
  const fn: ExtremeComponent<Props> = (
    element: HTMLElement,
    props: Props,
    replace: boolean = true,
    isTemplate?: boolean
  ) => {
    const result = component(props);
    const pushElement = isTemplate
      ? document.createElement("template")
      : element;
    
    const ele = render(pushElement, result.template, result, replace, isTemplate);
    currentCell.mount?.();
    resetCurrentCell();
    return ele;
  };
  fn.displayName = name;
  if (extreme.store[name]) {
    throw new Error(`Component ${name} already exists`);
  }
  extreme.store[name] = fn;
  return fn;
};
