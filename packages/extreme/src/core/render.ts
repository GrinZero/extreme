import { useState, type Ref } from "../hooks";
import { markIdHandler } from "../worker/render";
import {
  findDomStr,
  getDomID,
  addDomID,
  getRandomID,
  getHash,
  analyzeKey,
  getDomAttr,
  addDomAttr,
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
      if (typeof value === "function") {
        // @ts-ignore
        return (...rest) => value(...rest)[keys[i]];
      }
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
  template = markIdHandler(template, { ref, state });

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
        const keyIndex = (getDomAttr(baseDom, "key") || "key")
          .replace("{{", "")
          .replace("}}", "")
          .replace(`${itemName}.`, "");

        const list = getValue(state, listName);

        const signalCache = new Map<string, Function>();
        const renderItem = async (item: any, index: number) => {
          const curKey = String(item[keyIndex] ?? index);
          if (signalCache.has(curKey)) {
            const fn = signalCache.get(curKey)!;
            fn(item);
            return "";
          }

          const listID = getHash(curKey);
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
          const template = document.createElement("template");
          const cloneProps = { ...props };
          const [sign, setSign] = useState(item);
          signalCache.set(curKey, setSign);

          if (cloneProps.state && typeof cloneProps.state === "object") {
            cloneProps.state = {
              ...cloneProps.state,
              // TODO：通过设置state()的render，可以在item改变时触发render快速得到新的dom，不用重计算item
              ...{ [itemName]: sign },
              key: item[keyIndex] ?? index,
            };
          }
          if (!haveParentDom()) {
            setParentDom(ele);
          }
          const d = await render(template, newDom, cloneProps, false, true);
          setParentDom(null);
          return d?.outerHTML || "";
        };
        const renderList = async (data: any[]) => {
          const listDom: string[] = [];
          for (let i = 0; i < data.length; i++) {
            listDom.push(await renderItem(data[i], i));
          }
          return listDom;
        };

        if (typeof list === "function") {
          const rerenderList = async (newList: any[], oldList: any[]) => {
            const parent = document.getElementById(parentID);
            if (!parent) return;

            if (oldList.length === 0 && parent.children.length === 0) {
              const listDom = await renderList(newList).then((list) =>
                list.join("")
              );

              const tmp = document.createElement("template");
              tmp.innerHTML = listDom;
              const renderDom = tmp.content;
              parent.appendChild(renderDom);
              return;
            }

            const oldKeyToIndex = new Map(
              oldList.map((item, index) => [
                String(item[keyIndex] ?? index),
                index,
              ])
            );
            const newKeyToIndex = new Map(
              newList.map((item, index) => [
                String(item[keyIndex] ?? index),
                index,
              ])
            );

            const oldKeylist = oldList.map((item, index) =>
              String(item[keyIndex] ?? index)
            );
            const newKeylist = newList.map((item, index) => {
              return String(item[keyIndex] ?? index);
            });
            // 处理新增、移动、修改、删除的情况，确保顺序和位置正确，且最小化dom操作
            const usagKeyList = new Set(newKeylist);

            const toRemove: Element[] = [];
            const newKeySet = new Set(newKeylist);
            for (const oldKey of oldKeylist) {
              if (oldKey && !newKeySet.has(oldKey)) {
                const oldIndex = oldKeyToIndex.get(oldKey) ?? -1;
                const dom = parent.children[oldIndex];
                dom && toRemove.push(dom);
                signalCache.delete(oldKey);
              }
            }
            for (const dom of toRemove) {
              dom.remove();
            }
            const childNodes = Array.from(parent.children);

            if (newKeylist.length > 0) {
              // 移动、修改
              for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                const curKey = childNode.getAttribute("key");
                if (!curKey) continue;
                const index = newKeyToIndex.get(curKey) ?? -1;
                const oldIndex = oldKeyToIndex.get(curKey) ?? -1;
                const oldData = oldList[oldIndex];
                const newData = newList[index];

                if (!newData) {
                  continue;
                }

                if (index === oldIndex) {
                  // 位置正确，不需要移动
                  if (oldData !== newData && newList[index]) {
                    await renderItem(newList[index], index);
                    // if (renderDom !== childNode.outerHTML) {
                    //   childNode.outerHTML = renderDom;
                    // }
                  }
                } else {
                  if (index > oldIndex) {
                    const nextIndexElement = parent.children[index + 1];
                    if (nextIndexElement) {
                      parent.insertBefore(childNode, nextIndexElement);
                    } else {
                      parent.appendChild(childNode);
                    }
                  } else {
                    const indexElement = parent.children[index];
                    if (indexElement !== childNode) {
                      parent.insertBefore(childNode, indexElement);
                    }
                  }
                  if (oldData !== newData && newList[index]) {
                    await renderItem(newList[index], index);
                    // if (renderDom !== childNode.outerHTML) {
                    //   childNode.outerHTML = renderDom;
                    // }
                  }
                }
                usagKeyList.delete(curKey);
              }

              // 新增
              for (const curKey of usagKeyList) {
                const index = newKeylist.indexOf(curKey);
                if (!newList[index]) continue;
                const renderDom = await renderItem(newList[index], index);
                const nextIndexElement = parent.children[index + 1];
                const tmp = document.createElement("template");
                tmp.innerHTML = renderDom;
                const renderDomNode = tmp.content;
                if (nextIndexElement) {
                  parent.insertBefore(renderDomNode, nextIndexElement);
                } else {
                  parent.appendChild(renderDomNode);
                }
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

  // 第四阶段，渲染所有dom

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
          // debugger;
          if (typeof value === "function") {
            const updateDom = findDomStr(start, baseDomStr);
            const updateDomId = getDomID(updateDom);
            const analyzeUpdateKey = analyzeKey(
              updateDom,
              source,
              updateDom !== baseDomStr ? updateDom.indexOf(source) : start
            );
            if (analyzeUpdateKey === null) {
              // debugger;
              console.error(`[extreme] ${source} is not a valid UpdateKey`);
              return source;
            }
            const rerenderDom = () => {
              const dom =
                document.getElementById(updateDomId ?? ele?.id ?? id) ||
                document.getElementById(ele?.id ?? id);
              // debugger
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

  // add key

  if (state?.key) {
    let [newKeyDom] = addDomAttr(template, "key", state.key);
    template = newKeyDom;
  }

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
