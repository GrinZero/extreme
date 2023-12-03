export type Listener<T = any> = (v?: T, old?: T) => void;
let currentListener: Listener<any> | null = null;
export const [getCurrentListener, setCurrentListener] = [
  () => currentListener,
  (listener: Listener<any> | null) => {
    currentListener = listener;
  },
];
