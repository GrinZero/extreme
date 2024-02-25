import { findDomStr, getRandomID } from "./dom-str";

export const preRender = (template: string) => {
  // 第一步：为所有使用了{{}}的dom添加id
  const usageDomSet = new Set<string>();
  template.replace(/{{(.*?)}}/g, (_, _key, start) => {
    const dom = findDomStr(start, template);
    usageDomSet.add(dom);
    return _;
  });
  usageDomSet.forEach((dom) => {
    let id = "";
    if (dom.indexOf("id=") === -1) {
      id = getRandomID();
      const newDom = dom.replace(">", ` id="${id}">`);
      template = template.replace(dom, newDom);
    }
  });

  return template;
};
