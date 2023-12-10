export const getRandomID = () => "W" + Math.random().toString(36).slice(2, 10);

export const findDomStr = (index: number, htmlText: string) => {
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
  return htmlText.slice(firstDOMIndex, lastIndex);
};

export const getDomID = (domStr: string) => domStr.match(/id="(.*?)"/)?.[1];

export const addDomID = (domStr: string, newID: string | (() => string)) => {
  let id = "";
  const firstEndIndex = domStr.indexOf(">");
  const idIndex = domStr.indexOf("id=");
  if (idIndex === -1 || idIndex > firstEndIndex) {
    id = typeof newID === "function" ? newID() : newID;
    const replaceStr = ` id="${id}"`;
    if (domStr.indexOf("/>") !== -1) {
      domStr = domStr.replace("/>", replaceStr + "/>");
    } else {
      domStr = domStr.replace(">", replaceStr + ">");
    }
  } else {
    id = domStr.match(/id="(.*?)"/)?.[1] || getRandomID();
  }
  return [domStr, id];
};

export const getHash = (str: string) => "W" + btoa(str);

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
      return { type, key: template.slice(i + 1, start - 1) };
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
