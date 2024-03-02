export const getValue = (state: Record<string, any>, key: string) => {
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
