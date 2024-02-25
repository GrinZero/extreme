import template from "./index.html?raw";
import { createComponent } from "@sourcebug/extreme/dev";

export const MyButton = createComponent<{
  id: string;
  cb: () => void;
  title: string;
}>("MyButton", ({ id, cb, title }) => {
  return {
    template,
    state: {
      id,
      title,
    },
    methods: {
      cb,
    },
  };
});
