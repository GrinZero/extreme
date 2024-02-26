import { createComponent, useState } from "@sourcebug/extreme/dev";
import template from "./index.html?raw";

const random = (max: number) => Math.round(Math.random() * 1000) % max;

const A = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];

let nextId = 1;

const buildData = (count: number) => {
  const data = new Array(count);

  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
    };
  }

  return data;
};

export const Main = createComponent("Main", () => {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);

  const dispatch = (action: { type: string; id: number }) => {
    switch (action.type) {
      case "RUN":
        debugger
        setData(buildData(1000));
        setSelected(0);
        break;
      case "RUN_LOTS":
        setData(buildData(10000));
        setSelected(0);
        break;
      case "ADD":
        setData(data().concat(buildData(1000)));
        break;
      case "UPDATE": {
        const newData = data().slice(0);
        for (let i = 0; i < newData.length; i += 10) {
          const r = newData[i];
          newData[i] = { id: r.id, label: r.label + " !!!" };
        }
        setData(newData);
        break;
      }
      case "CLEAR":
        setData([]);
        setSelected(0);
        break;
      case "SWAP_ROWS":
        const newdata = [...data()];
        if (data().length > 998) {
          const d1 = newdata[1];
          const d998 = newdata[998];
          newdata[1] = d998;
          newdata[998] = d1;
        }
        setData(newdata);
        break;
      case "REMOVE": {
        const idx = data().findIndex((d) => d.id === action.id);
        setData([...data().slice(0, idx), ...data().slice(idx + 1)]);
        break;
      }
      case "SELECT":
        setSelected(action.id);
        break;
      default:
        break;
    }
  };

  return {
    template,
    state: {
      data,
      selected,
      dispatch,
    },
  };
});
