import { createComponent } from "@sourcebug/extreme/dev";
import template from "./index.html?raw";

export const Row = createComponent<{
  selected: () => number;
  item: () => { id: number; label: string };
  dispatch: (action: { type: string; id: number }) => void;
}>("Row", ({ selected, item, dispatch }) => {
  return {
    template,
    state: {
      item,
      containerClass: () => (selected() === item().id ? "danger" : ""),
    },
    methods: {
      handleSelect: () => {
        dispatch({ type: "SELECT", id: item().id });
      },
      handleRemove: () => dispatch({ type: "REMOVE", id: item().id }),
    },
  };
});
