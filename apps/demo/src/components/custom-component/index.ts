import { render } from "@/core";
import template from "./index.html?raw";

export const CustomComponent = (element: HTMLElement) => {
  const defaultData = [
    {
      src: "https://img.alicdn.com/imgextra/i4/O1CN01QYQ1QI1CZQYQ1QYQI_!!6000000001382-2-tps-200-200.png",
      content: "这是一段描述1，但是我是新的默认数据",
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

  return render(element, template, {
    state: {
      defaultData,
    },
  });
};
