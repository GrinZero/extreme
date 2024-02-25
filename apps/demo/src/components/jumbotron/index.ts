import template from "./index.html?raw";
import { createComponent } from "@sourcebug/extreme/dev";

export const Jumbotron = createComponent("Jumbotron", () => {
  return {
    template,
    state: {
      run: {
        title: "Create 1,000 rows",
        // id: "run",
        fn: () => console.log("run")
      },
    },
  };
});
