import template from "./index.html?raw";
import { createComponent, useMount } from "@sourcebug/extreme/dev";

export const MyButton = createComponent<{
  id: string;
  cb: () => void;
  title: string;
}>("MyButton", ({ id, cb, title }) => {
  useMount(() => {
    document.getElementById(id)?.addEventListener("click", cb);
    return () => {
      document.getElementById(id)?.removeEventListener("click", cb);
    };
  });

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
