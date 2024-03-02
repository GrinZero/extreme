import template from "./index.html?raw";
import { createComponent, useMount } from "@sourcebug/extreme/dev";

export const MyButton = createComponent<{
  sid: string;
  cb: () => void;
  title: string;
}>("MyButton", ({ sid, cb, title }) => {
  useMount(() => {
    document.getElementById(sid)?.addEventListener("click", cb);
    return () => {
      document.getElementById(sid)?.removeEventListener("click", cb);
    };
  });

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
