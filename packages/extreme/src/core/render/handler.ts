import {
  getRandomID,
  findDomStr,
  addDomID,
  getDomID,
  getDomAttr,
} from "../dom-str";

export const markIdHandler = (template: string) => {
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
  return template;
};

export const collectMethodHanlder = (template: string) => {
  const resultList: Array<{
    methodName: string;
    funcName: string;
    domId?: string;
  }> = [];
  template = template.replace(/@(.*?)}}"/g, (_, key, start) => {
    const [methodName, funcName] = key.split(`=\"{{`);
    const dom = findDomStr(start, template);
    const domId = getDomID(dom);
    resultList.push({
      methodName,
      funcName,
      domId,
    });
    return "";
  });

  return {
    template,
    result: resultList,
  };
};

export const collectIfTaskHandler = (template: string) => {
  const testIfResult: [string, string, number, string][] = [];
  template = template.replace(/:if="(.*?)"/g, (_, key, start) => {
    const baseDom = findDomStr(start, template);
    testIfResult.push([_, key, start, baseDom]);
    return _;
  });

  return testIfResult;
};

export interface ForTask {
  baseDom: string;
  itemName: string;
  listName: string;
  dom: string;
  parentDom: string;
  newParentDOM: string;
  parentID: string;
  keyIndex: string;
  key: string;
  start: number;
}

export const collectForTaskHandler = (template: string) => {
  const result: ForTask[] = [];
  template = template.replace(/:for="(.*?)"/g, (_, key, start) => {
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

    result.push({
      baseDom,
      itemName,
      listName,
      dom,
      parentDom,
      newParentDOM,
      parentID,
      keyIndex,
      key,
      start,
    });
    return _;
  });

  return result;
};

export const collectCustomTaskHandler = (template: string) => {

  const tasks: {
    componentName: string;
    propsTask: {
      type: "ref" | "state" | "text";
      key: string;
      value: string;
    }[];
    dom: string;
  }[] = [];
  template.replace(/<([A-Z].*?)[\/\>\s]/g, (source, name, start) => {
    const componentName = name.trim();

    const dom = findDomStr(start, template);
    const getPropsTask: {
      type: "ref" | "state" | "text";
      key: string;
      value: string;
    }[] = [];
    dom.replace(/\s(.*?)="(.*?)"/g, (_, _attrKey, _valueKey) => {
      const attrName = _attrKey.trim();
      const valueKey = _valueKey.trim();

      if (/{{(.*?)}}/.test(valueKey)) {
        const newValueKey = valueKey.split("{{")[1].split("}}")[0];

        if (attrName === "id") {
          getPropsTask.push({
            type: "ref",
            key: attrName,
            value: newValueKey,
          });
          return _;
        }

        if (attrName.startsWith(":")) {
          getPropsTask.push({
            type: "text",
            key: attrName,
            value: `{{${newValueKey}}}`,
          });
          return _;
        }

        if (!attrName.startsWith("@")) {
          getPropsTask.push({
            type: "state",
            key: attrName,
            value: newValueKey,
          });
          return _;
        }
      }

      getPropsTask.push({
        type: "text",
        key: attrName,
        value: valueKey,
      });
      return _;
    });

    tasks.push({ componentName, propsTask: getPropsTask, dom });
    return source;
  });

  return tasks;
};
