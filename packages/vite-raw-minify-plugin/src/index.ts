import { minify as htmlMinify } from "html-minifier";
import { minify as cssMinify } from "csso";

// import { preRender } from "./core";

const decode = (src: string) => {
  return src
    .split(`export default "`)[1]
    .slice(0, -1)
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "")
    .replace(/\\r/g, "")
    .replaceAll('\\"', '"');
};

const encode = (src: string) => {
  return `export default "${
    src.replaceAll('"', '\\"')
    // .replaceAll("\n", "\\n")
    // .replaceAll("\r", "\\r")
    // .replaceAll("\t", "\\t")
  }"`;
};

function rawMinifyPlugin() {
  return {
    name: "transform-file",
    transform(src: string, id: string) {
      if (id.endsWith("css?raw")) {
        const code = decode(src);
        const minifyCode = cssMinify(code).css;
        const result = encode(minifyCode);
        return {
          code: result,
          map: null,
        };
      }
      if (id.endsWith("html?raw")) {
        const code = decode(src);

        const minifyCode = htmlMinify(code, {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          html5: true,
          processConditionalComments: true,
          removeComments: true,
          removeRedundantAttributes: true,
          keepClosingSlash: true,
          caseSensitive: true,
        });
        const result = encode(minifyCode);
        return {
          code: result,
          map: null,
        };
      }
    },
  };
}

export { rawMinifyPlugin };
