import { render, useStyles, useRef, useState, useEffect } from "extreme";
import styles from "./index.css?raw";
import template from "./index.html?raw";

export const Counter = (element: HTMLElement) => {
  useStyles(styles);
  const resetRef = useRef();
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState(`<img src="123"/>`);

  const decrement = () => {
    setCount(count() - 1);
  };
  const increment = () => {
    setCount(count() + 1);
  };
  const submit = () => {
    setTitle("submit success");
  };

  const base = render(element, template, {
    state: {
      count,
      title,
    },
    ref: {
      resetRef,
    },
    methods: {
      decrement,
      increment,
      handleSubmit: submit,
    },
  });

  count((newV) => {
    console.log("newV", newV);
  });

  useEffect(() => {
    console.log("count&title", count(), title());
  }, [count, title]);

  resetRef()?.addEventListener("click", () => {
    setCount(0);
    setTitle("the form is not submit");
  });

  return base;
};
