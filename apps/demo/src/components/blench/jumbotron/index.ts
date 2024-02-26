import template from "./index.html?raw";
import { createComponent } from "@sourcebug/extreme/dev";

export const Jumbotron = createComponent<{
  dispatch: (action: { type: string }) => void;
}>("Jumbotron", ({ dispatch }) => {
  return {
    template,
    state: {
      run: () => dispatch({ type: "RUN" }),
      runLots: () => dispatch({ type: "RUN_LOTS" }),
      add: () => dispatch({ type: "ADD" }),
      update: () => dispatch({ type: "UPDATE" }),
      clear: () => dispatch({ type: "CLEAR" }),
      swapRows: () => dispatch({ type: "SWAP_ROWS" }),
    },
  };
});
