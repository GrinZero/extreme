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
    const source = data();

    const newKey =
      source.length > 0 ? Math.max(...source.map((item) => item.key)) + 1 : 1;
    setData([
      ...data(),
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述",
        title: "这是一段标题",
        key: newKey,
      },
    ]);
  };
  const handleMove = () => {
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
    ]);
  };
  const handleUpdate = () => {
    setData([
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述111[key没有变化]",
        title: "这是一段标题111",
        key: 1,
      },
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述",
        title: "这是一段标题",
        key: 2,
      },
    ]);
  };

  const list = useTemplate(element, template, {
    state: {
      items: data,
    },
    methods: {
      handleClear,
      handleReset,
      handleAdd,
      handleMove,
      handleUpdate,
    },
  });

  return list;
};
