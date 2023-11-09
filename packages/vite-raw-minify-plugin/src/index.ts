import { minify as htmlMinify } from "html-minifier";
import { minify as cssMinify } from "csso";

function rawMinifyPlugin() {
  return {
    name: "transform-file",
    transform(src: string, id: string) {
      if (id.endsWith("css?raw")) {
        const code = src.split(`export default "`)[1].slice(0, -1);
        const decodeCode = code
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "")
          .replace(/\\r/g, "")
          .replaceAll('\\"', '"');

        const minifyCode = cssMinify(decodeCode).css;
        const result = `export default "${minifyCode.replaceAll('"', '\\"')}"`;
        return {
          code: result,
          map: null,
        };
      }
      if (id.endsWith("html?raw")) {
        const code = src.split(`export default "`)[1].slice(0, -1);
        const decodeCode = code
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "")
          .replace(/\\r/g, "")
          .replaceAll('\\"', '"');

        const minifyCode = htmlMinify(decodeCode, {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          html5: true,
          processConditionalComments: true,
          removeComments: true,
          removeRedundantAttributes: true,
        });
        const result = `export default "${minifyCode.replaceAll('"', '\\"')}"`;
        return {
          code: result,
          map: null,
        };
      }
    },
  };
}

export { rawMinifyPlugin };
