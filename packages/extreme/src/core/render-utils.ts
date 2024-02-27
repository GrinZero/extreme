let parentDom: Element | null = null;
export const [getParentDom, setParentDom, haveParentDom] = [
  () => parentDom,
  (dom: Element | null) => {
    parentDom = dom;
  },
  () => parentDom !== null,
];

const eventStore = new Map<string, Map<string, Function>>();
export const addEventListener = (event: string, id: string, fn: Function) => {
  if (!eventStore.has(event)) {
    const fnMap = new Map<string, Function>();
    eventStore.set(event, fnMap);
    document.addEventListener(event, (e) => {
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
  }
  const methodStore = eventStore.get(event)!;
  if (!methodStore.has(id)) {
    methodStore.set(id, fn);
  }
};
