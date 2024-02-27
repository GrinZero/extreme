let parentDom: Element | null = null;
export const [getParentDom, setParentDom, haveParentDom] = [
  () => parentDom,
  (dom: Element | null) => {
    parentDom = dom;
  },
  () => parentDom !== null,
];
