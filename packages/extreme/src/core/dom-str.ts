export const getRandomID = () => "W" + Math.random().toString(36).slice(2, 10);

const domStrCache = new Map<string, string>();
export const findDomStr = (index: number, htmlText: string) => {
  const key = `${index}#-${htmlText}`;
  if (domStrCache.has(key)) {
    return domStrCache.get(key)!;
  }

  let firstDOMIndex = htmlText.lastIndexOf("<", index);

  let tag = "";
  for (let i = firstDOMIndex; i < htmlText.length; i++) {
    if (htmlText[i] === " " || htmlText[i] === ">" || htmlText[i] === "/") {
      tag = htmlText.slice(firstDOMIndex, i + 1);
      tag = tag.replace(/(<|>|\/)/g, "").trim();
      break;
    }
  }
  let lastIndex = index;
  findLastIndex: for (let i = index; i < htmlText.length; i++) {
    if (htmlText[i] === "<" && htmlText[i + 1] === "/") {
      for (let j = i; j < htmlText.length; j++) {
        if (htmlText[j] === ">") {
          const endTag = htmlText.slice(i + 2, j);
          if (endTag !== tag) {
            continue;
          }
          lastIndex = j + 1;
          break findLastIndex;
        }
      }
    }
    if (htmlText[i] === "/" && htmlText[i + 1] === ">") {
      lastIndex = i + 2;
      break;
    }
  }
  const result = htmlText.slice(firstDOMIndex, lastIndex);
  domStrCache.set(key, result);
  return result;
};

export const getDomAttr = (domStr: string, attr: string) => {
  return domStr.match(new RegExp(`${attr}="(.*?)"`))?.[1];
};
export const addDomAttr = (
  domStr: string,
  attr: string,
  value: string | (() => string)
) => {
  let attrValue = "";
  const firstEndIndex = domStr.indexOf(">");
  const attrIndex = domStr.indexOf(attr + "=");
  if (attrIndex === -1 || attrIndex > firstEndIndex) {
    attrValue = typeof value === "function" ? value() : value;
    const replaceStr = ` ${attr}="${attrValue}"`;
    if (domStr.indexOf("/>") !== -1) {
      domStr = domStr.replace("/>", replaceStr + "/>");
    } else {
      domStr = domStr.replace(">", replaceStr + ">");
    }
  } else {
    attrValue = getDomAttr(domStr, attr) || "";
  }
  return [domStr, attrValue];
};

export const getDomID = (domStr: string) => getDomAttr(domStr, "id");

export const addDomID = (domStr: string, newID: string | (() => string)) => {
  const [domStrWithID, id] = addDomAttr(domStr, "id", newID);
  return [domStrWithID, id || getRandomID()];
};

export const getHash = (str: string) => "W" + btoa(str).replace(/=/g, "~");

const analyzeDomCache = new Map<string, HTMLDivElement>();

export type AnalyzeUpdateKey =
  | { type: "attr" | "textContent"; key: string }
  | {
      type: "textNode";
      key: number;
      content: string;
    }
  | null;

export const analyzeKey = (
  template: string,
  source: string,
  start: number
): AnalyzeUpdateKey => {
  let type: string | undefined;
  let contentStart: number | undefined;
  for (let i = start; i >= 0; i--) {
    if (template[i] === "=") {
      type = "attr";
      continue;
    }
    if (template[i] === " " && type === "attr") {
      const key = template.slice(i + 1, start - 1);
      return { type, key: key.replace(/=/g, "") };
    }
    if (template[i] === ">") {
      type = "content";
      contentStart = i + 1;
      break;
    }
  }

  if (type === "content") {
    let tag = "";
    for (let i = 1; i < template.length; i++) {
      if (template[i] === " " || template[i] === ">") {
        tag = template.slice(1, i + 1);
        tag = tag.replace(/(<|>|\/)/g, "").trim();
        break;
      }
    }
    // because the template must be a <tag>...</tag> structure
    const endTag = `</${tag}>`;
    const endTagIndex = template.lastIndexOf(endTag);
    const textContent = template.slice(contentStart as number, endTagIndex);
    if (source === textContent) {
      return { type: "textContent", key: "textContent" };
    }
    // analyze the index of the childNodes

    let weakDom: HTMLDivElement;
    if (!analyzeDomCache.has(textContent)) {
      weakDom = document.createElement("div");
      weakDom.innerHTML = textContent;
    } else {
      weakDom = analyzeDomCache.get(textContent)!;
    }
    const childNodes = Array.from(weakDom.childNodes);
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (
        child.nodeType === Node.TEXT_NODE &&
        child.textContent?.indexOf(source) !== -1
      ) {
        return {
          type: "textNode",
          key: i,
          content: child.textContent!,
        };
      }
    }
  }

  return null;
};
