import template from "./index.html?raw";
import { createComponent } from "@sourcebug/extreme/dev";

export const MyButton = createComponent<{
  sid: string;
  cb: () => void;
  title: string;
}>("MyButton", ({ sid, cb, title }) => {

  return {
    template,
    state: {
      sid,
      title,
    },
    methods: {
      cb,
    },
  };
});
