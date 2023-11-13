import { useStyles, useTemplate, useState } from "@/hooks";
import styles from "./index.css?raw";
import template from "./index.html?raw";

const defaultData = [
  {
    src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
    content: "这是一段描述",
    title: "这是一段标题",
    key: 1,
  },
  {
    src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
    content: "这是一段描述",
    title: "这是一段标题",
    key: 2,
  },
];
export const List = (element: HTMLElement) => {
  useStyles(styles);

  const [data, setData] = useState(defaultData);

  const handleClear = () => {
    setData([]);
  };
  const handleReset = () => {
    setData(defaultData);
  };
  const handleAdd = () => {
    setData([...data(), defaultData[0]]);
  };
  const handleRemove=()=>{
    setData([
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述",
        title: "这是一段标题",
        key: 2,
      },
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述1",
        title: "这是一段标题1",
        key: 1,
      },
    ])
  }

  const list = useTemplate(element, template, {
    state: {
      items: data,
    },
    methods: {
      handleClear,
      handleReset,
      handleAdd,
      handleRemove
    },
  });

  return;
};
