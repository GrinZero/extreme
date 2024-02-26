import "./style.css";
import { App, Demo } from "./modules";
import { Main } from "./components";
export * from "./components";

const handleHashChange = () => {
  if (window.location.hash.match(/#\/demo/)) {
    Demo(document.getElementById("app")!, {}, false);
  } else if (window.location.hash.match(/#\/blench/)) {
    Main(document.getElementById("app")!, {}, false);
  } else {
    App(document.getElementById("app")!, {}, false);
  }
};

handleHashChange();
window.addEventListener("hashchange", handleHashChange);
