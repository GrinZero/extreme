import { render } from "extreme";
import template from "./index.html?raw";

export const Content = (element: HTMLElement) => {
  return render(element, template);
};
