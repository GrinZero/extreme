import type { Ref } from "../hooks";
import {
  findDomStr,
  getDomID,
  addDomID,
  getRandomID,
  getHash,
} from "./dom-str";
import { extreme } from "./extreme";

export interface TemplateProps {
  state?: Record<string, any> | null;
  ref?: Record<string, Ref> | null;
  methods?: Record<string, Function> | null;
}
export type Updater = (newData?: unknown, oldData?: unknown) => void;

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

export const render = <T extends HTMLElement>(
  element: T,
  template: string,
  props: TemplateProps = {
    state: null,
    ref: null,
  },
  replace: boolean = true
) => {
  const { state, ref, methods } = props;

  const stateSet = new Set<string>();
  const refSet = new Set<string>();
  const customJobs: [string, Function][] = [];

  // 递归阶段，将所有大写开头的DOM做处理
  {
    const customTasks: [string, string][] = [];
    template.replace(/<[A-Z].*?[\/\>\s]/g, (source, index) => {
      if (!extreme.store) return source;
      const componentName = source.slice(1, source.length - 1);
      const dom = findDomStr(index, template);
      const fn = extreme.store[componentName];
      const id = getRandomID();
      const newDom = `<div id="${id}"></div>`;
      customTasks.push([dom, newDom]);
      customJobs.push([id, fn]);
      return source;
    });
    customTasks.forEach(([dom, newDom]) => {
      template = template.replace(dom, newDom);
    });
  }

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
        id = getRandomID();
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
      // :if
      const ifTasks: [string, string][] = [];
      template = template.replace(/:if="{{(.*?)}}"/g, (_, key, start) => {
        const baseDom = findDomStr(start, template);
        const dom = baseDom.replace(_, "");
        const value = getValue(state, key);
        const id = getDomID(baseDom)!;
        const addTask = (value: boolean) => {
          if (value) {
            ifTasks.push([baseDom, dom]);
          }
          ifTasks.push([baseDom, ""]);
        };

        if (typeof value === "function") {
          let sibling: null | Element = null;
          let parent: null | Element = null;
          let open: boolean;
          const data = value(() => {
            const newOpen = value();
            if (newOpen === open) return;
            if (newOpen) {
              // 还原到初始状态并插入到原本的位置
              const tmp = document.createElement("template");
              const d = render(tmp, dom, props);
              const content = d.content.cloneNode(true);
              if (sibling && parent) {
                parent.insertBefore(sibling, content);
              } else if (!sibling && parent) {
                parent.appendChild(content);
              }
            } else {
              const element = document.getElementById(id);
              if (!element) return;
              sibling = sibling || element.nextElementSibling;
              parent = parent || element.parentElement;
              element.remove();
            }
            open = newOpen;
          });
          addTask(data);
          return _;
        }

        addTask(value);
        return _;
      });
      ifTasks.forEach(([baseDom, newDom]) => {
        template = template.replace(baseDom, newDom);
      });

      // :for
      const forTasks: [string, string][] = [];
      template = template.replace(/:for="(.*?)"/g, (_, key, start) => {
        const [itemName, listName] = key
          .trim()
          .split(" in ")
          .map((_: string) => _.trim());

        const baseDom = findDomStr(start, template);
        const dom = baseDom.replace(_, "");

        const parentDom = findDomStr(template.indexOf(baseDom) - 1, template);
        const [newParentDOM, parentID] = addDomID(parentDom, getRandomID());

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
                const renderDom = newListRender[index];
                const oldDom = oldListRender[index];
                if (index === oldIndex) {
                  // 位置正确，不需要移动
                  if (renderDom !== oldDom && renderDom) {
                    childNode.outerHTML = renderDom;
                  }
                } else {
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
                  if (renderDom !== oldDom && renderDom) {
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
        id = getRandomID();
        baseDomStr = baseDomStr.replace(">", ` id="${id}">`);
      } else {
        id = baseDomStr.match(/id="(.*?)"/)?.[1] || getRandomID();
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
    element.firstChild!.addEventListener(event, (e) => {
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

  {
    if (replace) {
      const parent = element.parentElement;
      if (element && parent && element.firstChild) {
        const firstChild = element.firstChild;
        parent.replaceChild(firstChild, element);
      }
    }
  }

  customJobs.forEach(([id, fn]) => {
    const element = document.getElementById(id);
    const parent = element?.parentElement;
    if (element && parent) {
      const newElement: HTMLElement = fn(element);
      if (newElement.firstChild) {
        const firstChild = newElement.firstChild;
        parent.replaceChild(firstChild, newElement);
      }
    }
  });

  return element;
};
