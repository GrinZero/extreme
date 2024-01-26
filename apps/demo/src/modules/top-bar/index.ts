import { createComponent } from "extreme";
import template from "./index.html?raw";

export const Topbar = createComponent("Topbar", () => {
  return {
    template,
    state: {
      title: "topbar",
    },
  };
});
