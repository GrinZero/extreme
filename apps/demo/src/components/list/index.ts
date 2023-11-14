import { useStyles, useTemplate, useState, useRef } from "@/hooks";
import styles from "./index.css?raw";
import template from "./index.html?raw";

const defaultData = [
  {
    src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
    content: "这是一段描述1",
    title: "这是一段标题1",
    key: 1,
  },
  {
    src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
    content: "这是一段描述2",
    title: "这是一段标题2",
    key: 2,
  },
];
export const List = (element: HTMLElement) => {
  useStyles(styles);

  const [data, setData] = useState(defaultData);
  const listRef = useRef();

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
        content: "这是一段描述" + newKey,
        title: "这是一段标题" + newKey,
        key: newKey,
      },
    ]);

    const listContainer = listRef();
    if (listContainer) {
      listContainer.scrollTop = listContainer.scrollHeight;
    }
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
        content: "这是一段描述Move+Update",
        title: "这是一段标题Move+Update",
        key: 1,
      },
    ]);
  };
  const handleUpdate = () => {
    setData([
      {
        src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
        content: "这是一段描述[key没有变化]",
        title: "这是一段标题",
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
    ref: {
      listRef,
    },
  });

  return list;
};
