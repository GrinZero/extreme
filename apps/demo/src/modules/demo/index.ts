import { useMount, createComponent, useRef, useState } from "extreme";
import template from "./index.html?raw";
import "./index.less";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";

export const Demo = createComponent("Demo", () => {
  const demoRef = useRef();
  const [open, setOpen] = useState(false);

  useMount(() => {
    console.log("Demo mounted", demoRef());
    const ele = document.querySelector(".read-the-docs");
    if(!ele){
      console.error("read-the-docs not found");
      return;
    }
    ele.addEventListener("click", () => {
      console.log("read-the-docs clicked");
      setOpen(!open());
    });
  });

  return {
    template,
    state: {
      viteLogo,
      typescriptLogo,
      open,
    },
    ref: { demoRef },
  };
});
