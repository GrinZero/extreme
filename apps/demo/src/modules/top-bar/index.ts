import { createComponent } from "@sourcebug/extreme/dev";
import template from "./index.html?raw";

export const Topbar = createComponent("Topbar", () => {
  return {
    template,
    state: {
      title: "topbar",
    },
  };
});
