export type ExtremeCell = {
  mount?: Function | null;
};
export let currentCell: ExtremeCell = {
  mount: null,
};
export const resetCurrentCell = () => {
  currentCell = {
    mount: null,
  };
};
