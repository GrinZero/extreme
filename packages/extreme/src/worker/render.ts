import { getRandomID, findDomStr, addDomID } from "../core/dom-str";
import type { Ref } from "../hooks";

export type PropsRef = Record<string, Ref> | null;
export type PropsState = Record<string, string | (() => string)> | null;

export const markIdHandler = (
  template: string,
  {
    ref,
    state,
  }: {
    ref?: PropsRef;
    state?: PropsState;
  } = {}
) => {
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
    if (state && _key in state && typeof state[_key] === "string") {
      // TODO: 增加对state function的支持
      return `id="${state[_key]}"`;
    }
    return _;
  });
  return template;
};

export const collectMethodHanlder=()=>{
    
}