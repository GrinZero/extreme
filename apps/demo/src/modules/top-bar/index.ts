import { render } from "extreme";
import template from "./index.html?raw";

export const Topbar = (element: HTMLElement) => {
  return render(element, template, {
    state: {
      title: "topbar",
    },
  });
};
