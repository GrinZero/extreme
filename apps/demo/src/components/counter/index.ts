import {
  useStyles,
  useRef,
  useState,
  useEffect,
  createComponent,
  useMount,
} from "@sourcebug/extreme/dev";
import styles from "./index.css?raw";
import template from "./index.html?raw";

export const Counter = createComponent("Counter", () => {
  const resetRef = useRef();
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState(`<img src="123"/>`);
  useStyles(styles);

  useMount(() => {
    resetRef()?.addEventListener("click", () => {
      setCount(0);
      setTitle("the form is not submit");
    });
  });

  const decrement = () => {
    setCount(count() - 1);
  };
  const increment = () => {
    setCount(count() + 1);
  };
  const submit = () => {
    setTitle("submit success");
  };

  count((newV) => {
    console.log("newV", newV);
  });

  useEffect(() => {
    console.log("count&title", count(), title());
  }, [count, title]);

  return {
    template,
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
  };
});
