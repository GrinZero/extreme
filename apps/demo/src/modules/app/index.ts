import { render } from "extreme";
import template from "./index.html?raw";

export const App = (element: HTMLElement) => {
  return render(element, template);
};
