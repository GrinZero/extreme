import { createComponent } from "@sourcebug/extreme/dev";
import template from "./index.html?raw";

export const App = createComponent("App", () => {
  return { template };
});
