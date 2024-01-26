import "./style.css";
import { App, Demo } from "./modules";
export * from "./components"
export * from "./modules"

const handleHashChange = () => {
  if (window.location.hash.match(/#\/demo/)) {
    Demo(document.getElementById("app")!, {}, false);
  } else {
    App(document.getElementById("app")!, {}, false);
  }
};

handleHashChange();
window.addEventListener("hashchange", handleHashChange);
