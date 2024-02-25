import { createComponent } from "@sourcebug/extreme/dev";
import template from "./index.html?raw";

export const Content = createComponent("Content", () => {
  return { template };
});
