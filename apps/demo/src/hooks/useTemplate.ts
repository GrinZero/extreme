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
      value = value[keys[i]];
    }
    return value;
  } else {
    return state[_key];
  }
};

const findDomStr = (start: number, template: string) => {
  let firstDOMIndex = start;
  for (let i = start; i >= 0; i--) {
    if (template[i] === "<") {
      firstDOMIndex = i;
      break;
    }
  }
  // 找到结束点，结束点包括两种情况：
  // 1. <img/>这样的自闭合标签，结束标志为/>
  // 2. <div></div>这样的闭合标签，结束标志为</之后的第一个>
  let lastIndex = start;
  findLastIndex: for (let i = start; i < template.length; i++) {
    if (template[i] === "<" && template[i + 1] === "/") {
      for (let j = i; j < template.length; j++) {
        if (template[j] === ">") {
          lastIndex = j + 1;
          break findLastIndex;
        }
      }
    }
    if (template[i] === "/" && template[i + 1] === ">") {
      lastIndex = i + 2;
      break;
    }
  }
  return template.slice(firstDOMIndex, lastIndex);
};

const getDomID = (domStr: string) => {
  const id = domStr.match(/id="(.*?)"/)?.[1];
  return id;
};

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
    const usageDomArr = template.match(/{{(.*?)}}/g);
    if (usageDomArr) {
      for (let i = 0; i < usageDomArr.length; i++) {
        const usageDom = usageDomArr[i];
        const dom = findDomStr(template.indexOf(usageDom), template);
        usageDomSet.add(dom);
      }
    }
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
      if(!target.id) return;
      const fn = fnMap.get(target.id);
      if (fn) {
        fn(e);
      }
    });
  });

  return element;
};
