import { useStyles, useTemplate, useRef, useState } from "@/hooks";
import styles from "./index.css?raw";
import template from "./index.html?raw";

export const Counter = (element: HTMLElement) => {
  useStyles(styles);
  const incrementRef = useRef();
  const decrementRef = useRef();
  const cleanRef = useRef();
  const [count, setCount] = useState(0);
  const [src, setSrc] = useState("https://www.baidu.com/img/flexible/logo/pc/result.png");

  const base = useTemplate(element, template, {
    state: {
      count: count,
      src,
    },
    ref: {
      incrementRef,
      decrementRef,
      cleanRef
    },
  });

  console.log("decrementRef", decrementRef());
  decrementRef()?.addEventListener("click",()=>{
    setCount(count() - 1);
  })
  incrementRef()?.addEventListener("click",()=>{
    setCount(count() + 1);
  })
  cleanRef()?.addEventListener("click",()=>{
    setSrc("");
    setCount(0);
  })
  return base;
};
