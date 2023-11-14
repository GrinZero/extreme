import { useID } from "./useID";
import type { Ref } from "./useRef";

export interface TemplateProps {
  state?: Record<string, any> | null;
  ref?: Record<string, Ref> | null;
  methods?: Record<string, Function> | null;
}

const getValue = (state: Record<string, any>, key: string) => {
  const _key = key.trim();
  const keys = _key.split(".");
  if (keys.length > 1) {
    let value = state;
    for (let i = 0; i < keys.length; i++) {
      if (!value) return;
      value = value[keys[i]];
    }
    return value;
  } else {
    return state[_key];
  }
};

function findDomStr(index: number, htmlText: string) {
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
}

const getDomID = (domStr: string) => {
  const id = domStr.match(/id="(.*?)"/)?.[1];
  return id;
};
const addDomID = (domStr: string, newID: string) => {
  let id = "";
  const firstEndIndex = domStr.indexOf(">");
  const idIndex = domStr.indexOf("id=");
  if (idIndex === -1 || idIndex > firstEndIndex) {
    id = newID;
    domStr = domStr.replace(">", ` id="${id}">`);
  } else {
    id = domStr.match(/id="(.*?)"/)?.[1] || useID();
  }
  return [domStr, id];
};
const getHash = (str: string) => "W" + str.charCodeAt(0).toString(16);

export const useTemplate = (
  element: HTMLElement,
  template: string,
  props: TemplateProps = {
    state: null,
    ref: null,
  }
) => {
  const { state, ref, methods } = props;

  const stateSet = new Set<string>();
  const refSet = new Set<string>();

  // 第一阶段，为所有使用了{{}}的dom添加id，或者对id="{{ref}}"的dom进行替换
  {
    const usageDomSet = new Set<string>();
    template.replace(/{{(.*?)}}/g, (_, _key, start) => {
      const dom = findDomStr(start, template);
      usageDomSet.add(dom);
      return _;
    });
    usageDomSet.forEach((dom) => {
      let id = "";
      if (dom.indexOf("id=") === -1) {
        id = useID();
        const newDom = dom.replace(">", ` id="${id}">`);
        template = template.replace(dom, newDom);
      }
    });
    template = template.replace(/id="{{(.*?)}}"/g, (_, key) => {
      const _key = key.trim();
      if (ref && _key in ref) {
        refSet.add(_key);
        return `id="${ref[_key]}"`;
      }
      return _;
    });
  }

  // 第二阶段，收集所有methods和对应的DOM节点
  const methodsMap = new Map<string, [string, Function][]>();
  {
    template = template.replace(/@(.*?)}}"/g, (_, key, start) => {
      const [methodName, funcName] = key.split(`=\"{{`);
      const dom = findDomStr(start, template);
      const id = getDomID(dom);
      if (methods && funcName in methods && id) {
        if (!methodsMap.has(methodName)) {
          methodsMap.set(methodName, [[id, methods[funcName]]]);
        } else {
          const arr = methodsMap.get(methodName) || [];
          arr.push([id, methods[funcName]]);
          methodsMap.set(methodName, arr);
        }
      }
      return "";
    });
  }

  // 第三阶段，识别:for和:if
  {
    if (state) {
      const forTasks: [string, string][] = [];
      template = template.replace(/:for="(.*?)"/g, (_, key, start) => {
        if (!state) return _;
        const [itemName, listName] = key
          .trim()
          .split(" in ")
          .map((_: string) => _.trim());

        const baseDom = findDomStr(start, template);
        const dom = baseDom.replace(_, "");

        const parentDom = findDomStr(template.indexOf(baseDom) - 1, template);
        const [newParentDOM, parentID] = addDomID(parentDom, useID());

        const list = getValue(state, listName);

        const render = (data: any[]) => {
          const domList = data.map((item: any, index: number) => {
            const listID = getHash(String(item.key ?? index));
            let [newDom] = addDomID(dom, listID);
            newDom = newDom.replace(/id="(.*?)"/g, (source, key) => {
              if (key === listID) {
                return source;
              }
              return `id="${listID}Y${key}"`;
            });
            newDom = newDom.replace(/{{(.*?)}}/g, (_, key) => {
              const value = getValue(item, key.replace(`${itemName}.`, ""));
              if (typeof value === "function") {
                return value();
              }
              return value;
            });
            return newDom;
          });
          return domList;
        };

        if (typeof list === "function") {
          const data = list((newList: any[], oldList: any[]) => {
            const parent = document.getElementById(parentID);
            if (!parent) return;
            const oldListRender = render(oldList);
            const newListRender = render(newList);
            const oldIDList = oldListRender.map((item) => getDomID(item));
            const newIDList = newListRender.map((item) => getDomID(item));
            // 处理新增、移动、修改、删除的情况，确保顺序和位置正确，且最小化dom操作
            const childNodes = Array.from(parent.children);
            const useagNewIDList = new Set(newIDList);
            if (newIDList.length > 0) {
              // 移动、修改
              for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                const id = childNode.id;
                if (!id) continue;
                const index = newIDList.indexOf(id);
                const oldIndex = oldIDList.indexOf(id);
                if (index === oldIndex) {
                  // 位置正确，不需要移动
                  const renderDom = newListRender[index];
                  const oldDom = oldListRender[index];
                  if (renderDom !== oldDom) {
                    childNode.outerHTML = renderDom;
                  }
                } else {
                  const renderDom = newListRender[index];
                  const oldDom = oldListRender[oldIndex];
                  const nextIndexElement = parent.children[index + 1];
                  if (index > oldIndex) {
                    if (nextIndexElement) {
                      parent.insertBefore(childNode, nextIndexElement);
                    } else {
                      parent.appendChild(childNode);
                    }
                  } else {
                    parent.insertBefore(childNode, nextIndexElement);
                  }
                  if (renderDom !== oldDom) {
                    childNode.outerHTML = renderDom;
                  }
                }
                useagNewIDList.delete(id);
              }
              // 新增
              useagNewIDList.forEach((id) => {
                const index = newIDList.indexOf(id);
                const renderDom = newListRender[index];
                const nextIndexElement = parent.children[index + 1];
                const tmp = document.createElement("template");
                tmp.innerHTML = renderDom;
                const renderDomNode = tmp.content;
                if (nextIndexElement) {
                  parent.insertBefore(renderDomNode, nextIndexElement);
                } else {
                  parent.appendChild(renderDomNode);
                }
              });
            }

            // 删除
            oldIDList.forEach((id) => {
              if (newIDList.indexOf(id) === -1 && id) {
                const dom = document.getElementById(id);
                if (dom) {
                  dom.remove();
                }
              }
            });
          });
          const listDom = render(data);
          forTasks.push([
            parentDom,
            newParentDOM.replace(baseDom, listDom.join("")),
          ]);
        }
        return _;
      });
      forTasks.forEach(([baseDom, newDom]) => {
        template = template.replace(baseDom, newDom);
      });
    }
  }

  let templateStr = template;
  const baseTemplate = template.replace(/{{(.*?)}}/g, (source, key, start) => {
    if (!state) return `[without state "${key}"]`;
    key = key.trim();
    if (ref && key in ref) {
      refSet.add(key);
      return ref[key];
    }
    const value = getValue(state, key);

    if (typeof value === "function") {
      const dom = findDomStr(start, template);
      stateSet.add(dom);
      return source;
    }

    return value;
  });

  templateStr = baseTemplate;

  const stateArray = Array.from(stateSet);
  if (state) {
    for (let i = 0; i < stateArray.length; i++) {
      let domStr = stateArray[i];
      const sourceDomStr = domStr.replace(/{{(.*?)}}/g, (source, key) => {
        key = key.trim();
        if (ref && key in ref) {
          refSet.add(key);
          return ref[key] as unknown as string;
        }
        const value = getValue(state, key);
        if (typeof value === "function") {
          return source;
        }
        return value;
      });
      let baseDomStr = sourceDomStr;

      let id = "";
      if (baseDomStr.indexOf("id=") === -1) {
        id = useID();
        baseDomStr = baseDomStr.replace(">", ` id="${id}">`);
      } else {
        id = baseDomStr.match(/id="(.*?)"/)?.[1] || useID();
      }

      const update = () => {
        return baseDomStr.replace(/{{(.*?)}}/g, (_, key) => {
          const value = getValue(state, key);
          if (typeof value === "function") {
            return value();
          }
          return value;
        });
      };

      const newDomStr = baseDomStr.replace(/{{(.*?)}}/g, (_, key) => {
        const value = getValue(state, key);
        if (typeof value === "function") {
          return value(() => {
            const dom = document.getElementById(id);
            if (!dom) return;
            dom.outerHTML = update();
          });
        }

        return value;
      });
      templateStr = templateStr.replace(sourceDomStr, newDomStr);
    }
  }
  element.innerHTML = templateStr;

  // 遍历methodsMap，通过事件委托在父节点上绑定事件
  methodsMap.forEach((arr, event) => {
    const fnMap = new Map();
    arr.forEach(([id, fn]) => {
      fnMap.set(id, fn);
    });
    element.addEventListener(event, (e) => {
      const target = e.target as HTMLElement;
      if (target.id) {
        const fn = fnMap.get(target.id);
        if (fn) {
          fn(e);
        }
        return;
      }
      for (const [id, fn] of fnMap) {
        const dom = document.getElementById(id);
        if (!dom) continue;
        if (dom.contains(target) && fn) {
          fn(e);
          return;
        }
      }
    });
  });

  return element;
};
