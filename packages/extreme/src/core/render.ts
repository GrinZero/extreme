import { idleCallback, type Ref } from "../hooks";
import {
  findDomStr,
  getDomID,
  addDomID,
  getRandomID,
  getHash,
  analyzeKey,
} from "./dom-str";
import { extreme } from "./extreme";
import { setCurrentListener } from "./listener";
import { addEventListener, haveParentDom, setParentDom } from "./render-utils";

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
const encodeValue = (value: any) => {
  const str = String(value);
  return str.replace(/[\u00A0-\u9999<>\&]/gim, (i) => `&#${i.charCodeAt(0)};`);
};

export type ExtremeElement<T extends HTMLElement | HTMLTemplateElement> =
  | T
  | null
  | Element;
export async function render<T extends HTMLElement | HTMLTemplateElement>(
  element: T,
  template: string,
  props: TemplateProps = {
    state: null,
    ref: null,
    methods: null,
  },
  replace: boolean = true,
  isTemplate?: boolean
): Promise<ExtremeElement<T>> {
  const { state, ref, methods } = props;

  const isTemplateNode = element.nodeName === "TEMPLATE" || isTemplate;
  const stateSet = new Set<string>();
  const customJobs: [string, Function, Record<string, unknown>][] = [];
  const methodsMap = new Map<string, [string, Function][]>();

  const addMethodTask = (methodName: string, funcName: string, dom: string) => {
    const id = getDomID(dom);
    if (methods && funcName in methods && id) {
      const task = [id, methods[funcName]] as [string, Function];
      if (!methodsMap.has(methodName)) {
        methodsMap.set(methodName, [task]);
      } else {
        methodsMap.get(methodName)!.push(task);
      }
    }
  };

  // 第一阶段，为所有使用了{{}}的dom添加id，或者对id="{{ref}}"的dom进行替换
  {
    const usageDomSet = new Set<string>();
    template.replace(/{{(.*?)}}/g, (_, _key, start) => {
      usageDomSet.add(findDomStr(start, template));
      return _;
    });
    usageDomSet.forEach((dom) => {
      if (dom.indexOf("id=") === -1) {
        const [newDom] = addDomID(dom, getRandomID);
        template = template.replace(dom, newDom);
      }
    });
    template = template.replace(/id="{{(.*?)}}"/g, (_, key) => {
      const _key = key.trim();
      if (ref && _key in ref) {
        return `id="${ref[_key]}"`;
      }
      if(state && _key in state && typeof state[_key] === "string"){
        // TODO: 增加对state function的支持
        return `id="${state[_key]}"`;
      }
      return _;
    });
  }
  // 第二阶段，收集所有methods和对应的DOM节点
  {
    template = template.replace(/@(.*?)}}"/g, (_, key, start) => {
      const [methodName, funcName] = key.split(`=\"{{`);
      addMethodTask(methodName, funcName, findDomStr(start, template));
      return "";
    });
  }

  // 第三阶段，识别:for和:if
  {
    if (state) {
      // :if
      const ifTasks: [string, string][] = [];
      const testIfResult: [string, string, number][] = [];
      template = template.replace(/:if="(.*?)"/g, (_, key, start) => {
        testIfResult.push([_, key, start]);
        return _;
      });

      for (const [_, key, start] of testIfResult) {
        const baseDom = findDomStr(start, template);
        const dom = baseDom.replace(_, "");
        const value = getValue(state, key);
        const id = getDomID(baseDom)!;

        const addTask = (value?: boolean | null) => {
          ifTasks.push([
            baseDom,
            value ? dom : `<template id="${id}"></template>`,
          ] as [string, string]);
        };

        if (typeof value === "function") {
          let sibling: null | Element = null;
          let parent: null | Element = null;
          let open: boolean | null | undefined = null;
          const rerenderIf = async () => {
            const newOpen = value();
            if (newOpen === open) return;
            const element = document.getElementById(id);
            if (
              !sibling &&
              !parent &&
              element &&
              element.nodeName === "TEMPLATE"
            ) {
              sibling = element.nextElementSibling;
              parent = element.parentElement;
              element.remove();
            }
            if (newOpen) {
              // 还原到初始状态并插入到原本的位置
              const tmp = document.createElement("template");
              if (!haveParentDom()) {
                setParentDom(ele);
              }
              const d = await render(tmp, dom, props);
              setParentDom(null);
              const content = d as Element;

              if (sibling && parent) {
                parent.insertBefore(sibling, content);
              } else if (!sibling && parent) {
                parent.appendChild(content);
              }
            } else {
              if (!element) return;
              sibling = sibling || element.nextElementSibling;
              parent = parent || element.parentElement;
              element.remove();
            }
            open = newOpen;
          };
          setCurrentListener(rerenderIf);
          const data = value();
          setCurrentListener(null);
          open = data;
          addTask(data);
        }

        addTask(value);
      }

      for (const [baseDom, newDom] of ifTasks) {
        template = template.replace(baseDom, newDom);
      }

      // :for
      const forTasks: [string, string][] = [];

      const testForResult: [string, string, number][] = [];
      template = template.replace(/:for="(.*?)"/g, (_, key, start) => {
        testForResult.push([_, key, start]);
        return _;
      });
      for (const [_, key, start] of testForResult) {
        const [itemName, listName] = key
          .trim()
          .split(" in ")
          .map((_: string) => _.trim());

        const baseDom = findDomStr(start, template);
        const dom = baseDom.replace(_, "");
        const parentDom = findDomStr(template.indexOf(baseDom) - 1, template);
        const [newParentDOM, parentID] = addDomID(parentDom, getRandomID);

        const list = getValue(state, listName);
        const renderList = async (data: any[]) => {
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
              if (key === itemName) {
                return _;
              }
              const value = getValue(item, key.replace(`${itemName}.`, ""));
              if (value === undefined) {
                return _;
              }
              return encodeValue(typeof value === "function" ? value() : value);
            });
            return newDom;
          });
          return await Promise.all(
            domList.map((domStr, i) => {
              const template = document.createElement("template");
              const cloneProps = { ...props };
              if (cloneProps.state && typeof cloneProps.state === "object") {
                cloneProps.state = {
                  ...cloneProps.state,
                  ...{ [itemName]: data[i] },
                };
              }
              return new Promise<string>((resolve) => {
                idleCallback(async () => {
                  if (!haveParentDom()) {
                    setParentDom(ele);
                  }
                  const d = await render(
                    template,
                    domStr,
                    cloneProps,
                    false,
                    true
                  );
                  setParentDom(null);
                  resolve(d?.outerHTML || "");
                });
              });
            })
          );
        };

        if (typeof list === "function") {
          const rerenderList = async (newList: any[], oldList: any[]) => {
            const parent = document.getElementById(parentID);
            if (!parent) return;

            const oldListRender = await renderList(oldList);
            const newListRender = await renderList(newList);
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
            for (const id of oldIDList) {
              if (newIDList.indexOf(id) === -1 && id) {
                const dom = document.getElementById(id);
                dom && dom.remove();
              }
            }
          };
          setCurrentListener(rerenderList);
          const data = list(rerenderList);
          setCurrentListener(null);
          const listDom = await renderList(data);
          forTasks.push([
            parentDom,
            newParentDOM.replace(baseDom, listDom.join("")),
          ]);
        }

        const listDom = await renderList(
          typeof list === "function" ? list() : list
        );
        forTasks.push([
          parentDom,
          newParentDOM.replace(baseDom, listDom.join("")),
        ]);
      }
      for (const [baseDom, newDom] of forTasks) {
        template = template.replace(baseDom, newDom);
      }
    }
  }

  // 递归阶段，将所有大写开头的DOM做处理
  {
    const customTasks: [string, string][] = [];
    template.replace(/<([A-Z].*?)[\/\>\s]/g, (source, name, start) => {
      if (!extreme.store) return source;
      const componentName = name.trim();

      const dom = findDomStr(start, template);
      const fn = extreme.store[componentName];
      const propsCurrent: Record<string, unknown> = {};
      dom.replace(/\s(.*?)="(.*?)"/g, (_, _attrKey, _valueKey) => {
        const attrName = _attrKey.trim();
        const valueKey = _valueKey.trim();

        if (/{{(.*?)}}/.test(valueKey)) {
          const newValueKey = valueKey.split("{{")[1].split("}}")[0];

          if (attrName === "id" && ref) {
            propsCurrent[attrName] = getValue(ref, newValueKey);
            return _;
          }

          if (attrName.startsWith(":")) {
            propsCurrent[attrName] = `{{${newValueKey}}}`;
            return _;
          }

          if (state && !attrName.startsWith("@")) {
            propsCurrent[attrName] = getValue(state, newValueKey);
            return _;
          }
        }

        propsCurrent[attrName] = valueKey;
        return _;
      });

      const id = (propsCurrent.id as string) || getDomID(dom) || getRandomID();
      let newDom = `<div id="${id}"`;
      if (":if" in props) {
        newDom += ` :if="${props[":if"]}"`;
        delete props[":if"];
      }
      if (":for" in props) {
        newDom += ` :for="${props[":for"]}"`;
        delete props[":for"];
      }
      Object.keys(props).forEach((key) => {
        if (key.startsWith("@")) {
          newDom += ` ${key}="${propsCurrent[key]}"`;
          delete propsCurrent[key];
        }
      });

      newDom += `></div>`;
      customTasks.push([dom, newDom]);
      customJobs.push([id, fn, propsCurrent]);
      return source;
    });
    for (const [dom, newDom] of customTasks) {
      template = template.replace(dom, newDom);
    }
  }

  template = template.replace(/{{(.*?)}}/g, (source, key, start) => {
    if (!state) return `[without state "${key}"]`;
    key = key.trim();
    if (ref && key in ref) {
      return ref[key] as unknown as string;
    }
    const value = getValue(state, key);

    if (typeof value === "function") {
      stateSet.add(findDomStr(start, template));
      return source;
    }
    return encodeValue(value);
  });

  if (state) {
    const stateArray = Array.from(stateSet);
    for (let i = 0; i < stateArray.length; i++) {
      let domStr = stateArray[i];
      const sourceDomStr = domStr.replace(/{{(.*?)}}/g, (source, key) => {
        key = key.trim();
        if (ref && key in ref) {
          return ref[key] as unknown as string;
        }
        const value = getValue(state, key);
        return typeof value === "function" ? source : encodeValue(value);
      });
      const [baseDomStr, id] = addDomID(sourceDomStr, getRandomID);
      const newDomStr = baseDomStr.replace(
        /{{(.*?)}}/g,
        (source, key, start) => {
          const value = getValue(state, key);
          if (typeof value === "function") {
            const analyzeUpdateKey = analyzeKey(baseDomStr, source, start);
            if (analyzeUpdateKey === null) {
              console.error(`[extreme] ${source} is not a valid UpdateKey`);
              return source;
            }
            const rerenderDom = () => {
              const dom = document.getElementById(ele?.id || id);
              if (!dom) return;
              const newValue = encodeValue(value());
              switch (analyzeUpdateKey.type) {
                case "textContent":
                  dom.textContent = newValue;
                  break;
                case "attr":
                  dom.setAttribute(analyzeUpdateKey.key, newValue);
                  break;
                case "textNode":
                  dom.childNodes[analyzeUpdateKey.key].textContent =
                    analyzeUpdateKey.content.replace(/{{(.*?)}}/g, (_, key) => {
                      const value = getValue(state, key);
                      return encodeValue(
                        typeof value === "function" ? value() : value
                      );
                    });
                  break;
              }
            };
            setCurrentListener(rerenderDom);
            const newValue = encodeValue(value());
            setCurrentListener(null);
            return newValue;
          }
          return encodeValue(value);
        }
      );
      template = template.replace(sourceDomStr, newDomStr);
    }
  }

  const parent = isTemplateNode
    ? (element as HTMLTemplateElement).content
    : element.parentElement;
  const index = parent
    ? Array.prototype.indexOf.call(parent.children, element)
    : -1;

  element.innerHTML = template;

  let ele = isTemplateNode
    ? (element as HTMLTemplateElement).content.firstElementChild
    : element.firstElementChild;

  const backElement =
    index !== -1 && parent ? (parent.children[index] as T) : ele;

  // 第四阶段，处理所有自定义组件

  if (backElement) {
    for (const [id, fn, propsCurrent] of customJobs) {
      const isRoot =
        backElement.nodeName === "TEMPLATE" || backElement.id === id;
      const newEle = isRoot
        ? backElement
        : backElement.querySelector(`#${id}`) || document.getElementById(id);

      const isFirst = backElement.firstElementChild === newEle;

      if (newEle) {
        if (!haveParentDom()) {
          setParentDom(ele);
        }
        const newElement: HTMLElement = await fn(
          newEle,
          propsCurrent,
          false,
          isTemplate
        );
        setParentDom(null);
        newElement.id = newElement.id || id;
        if (isRoot || isFirst) {
          ele = newElement;
        }
      }
    }
  }

  // 遍历methodsMap，通过事件委托在根节点上绑定事件
  methodsMap.forEach((arr, event) => {
    const fnMap = new Map();
    arr.forEach(([id, fn]) => {
      fnMap.set(id, fn);
      addEventListener(event, id, fn);
    });
  });

  {
    if (replace) {
      if (!isTemplateNode && element.contains(ele)) {
        element.replaceWith(ele!);
      }
    }
  }

  return ele;
}

// window.render = render;
