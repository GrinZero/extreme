import { currentCell } from "../core/cell";
export const useMount = (fn: Function) => {
  currentCell.mount = fn;
};
