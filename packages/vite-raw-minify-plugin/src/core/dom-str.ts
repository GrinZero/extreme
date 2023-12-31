export const getRandomID = () => "W" + Math.random().toString(36).slice(2, 10);

export const findDomStr = (index: number, htmlText: string) => {
  let firstDOMIndex = index;
  for (let i = index; i >= 0; i--) {
    if (htmlText[i] === "<") {
      firstDOMIndex = i;
      break;
    }
  }

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

export const getDomID = (domStr: string) => {
  const id = domStr.match(/id="(.*?)"/)?.[1];
  return id;
};

export const addDomID = (domStr: string, newID: string) => {
  let id = "";
  const firstEndIndex = domStr.indexOf(">");
  const idIndex = domStr.indexOf("id=");
  if (idIndex === -1 || idIndex > firstEndIndex) {
    id = newID;
    domStr = domStr.replace(">", ` id="${id}">`);
  } else {
    id = domStr.match(/id="(.*?)"/)?.[1] || getRandomID();
  }
  return [domStr, id];
};

export const getHash = (str: string) => "W" + btoa(str)
