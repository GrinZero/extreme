const styleSet = new Set<string>();

export const useStyles = (style: string) => {
  if (!styleSet.has(style)) {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
    styleSet.add(style);
  }
};
