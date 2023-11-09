import { useID } from ".";
import type { Ref } from "./useRef";

export interface TemplateProps {
  state?: Record<string, any> | null;
  ref?: Record<string, Ref> | null;
}

export const useTemplate = (
  element: HTMLElement,
  template: string,
  props: TemplateProps = {
    state: null,
    ref: null,
  }
) => {
  const { state, ref } = props;

  const stateSet = new Set<string>();
  let templateStr = "";
  const baseTemplate = template.replace(/{{(.*?)}}/g, (source, key, start) => {
    if (!state) return `[without state "${key}"]`;
    key = key.trim();
    if (ref && key in ref) {
      return ref[key];
    }
    const keys = key.split(".");
    const value = (() => {
      if (keys.length > 1) {
        let value = state;
        for (let i = 0; i < keys.length; i++) {
          value = value[keys[i]];
        }
        return value;
      } else {
        return state[key];
      }
    })();

    if (typeof value === "function") {
      let firstDOMIndex = start;
      for (let i = start; i >= 0; i--) {
        if (template[i] === "<") {
          firstDOMIndex = i;
          break;
        }
      }
      let lastDOMIndex = start;
      for (let i = start; i < template.length; i++) {
        if (template[i] === ">") {
          lastDOMIndex = i;
          break;
        }
      }
      const dom = template.slice(firstDOMIndex, lastDOMIndex + 1);
      stateSet.add(dom);
      return source;
    }

    return value;
  });

  templateStr = baseTemplate;
  const stateArray = Array.from(stateSet);
  if (state) {
    stateArray.forEach((domStr) => {
      const baseDomStr = domStr;
      let id = "";
      if (!domStr.includes("id=")) {
        id = useID();
        domStr = domStr.replace(">", ` id="${id}">`);
      } else {
        id = domStr.match(/id="(.*?)"/)?.[1] || useID();
      }

      const update = () => {
        return domStr.replace(/{{(.*?)}}/g, (_, key) => {
          key = key.trim();
          const keys = key.split(".");
          const value = (() => {
            if (keys.length > 1) {
              let value = state;
              for (let i = 0; i < keys.length; i++) {
                value = value[keys[i]];
              }
              return value;
            } else {
              return state[key];
            }
          })();

          if (typeof value === "function") {
            return value();
          }
          return value;
        });
      };

      const newDomStr = domStr.replace(/{{(.*?)}}/g, (_, key) => {
        key = key.trim();
        const keys = key.split(".");
        const value = (() => {
          if (keys.length > 1) {
            let value = state;
            for (let i = 0; i < keys.length; i++) {
              value = value[keys[i]];
            }
            return value;
          } else {
            return state[key];
          }
        })();

        if (typeof value === "function") {
          return value(() => {
            const dom = document.getElementById(id);
            if (!dom) return;
            dom.innerHTML = update();
          });
        }

        return value;
      });
      templateStr = templateStr.replace(baseDomStr, newDomStr);
    });
  }

  console.log("templateStr", templateStr);
  element.innerHTML = templateStr;

  return element;
};
