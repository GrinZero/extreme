import { useStyles, useTemplate, useRef, useState } from "@/hooks";
import styles from "./index.css?raw";
import template from "./index.html?raw";

export const Counter = (element: HTMLElement) => {
  useStyles(styles);
  const resetRef = useRef();
  const [count, setCount] = useState(0);

  const decrement = () => {
    setCount(count() - 1);
  };
  const increment = () => {
    setCount(count() + 1);
  }

  const base = useTemplate(element, template, {
    state: {
      count
    },
    ref: {
      resetRef,
    },
    methods: {
      decrement,
      increment
    },
  });

  count((newV) => {
    console.log("newV", newV);
  });

  resetRef()?.addEventListener("click", () => {
    setCount(0);
  });
  return base;
};
