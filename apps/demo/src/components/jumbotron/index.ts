import template from "./index.html?raw";
import { createComponent } from "@sourcebug/extreme/dev";

export const Jumbotron = createComponent("Jumbotron", () => {
  return {
    template,
    state: {
      items: [
        { title: "a", key: "a" },
        { title: "b", key: "b" },
      ],
    },
  };
});
