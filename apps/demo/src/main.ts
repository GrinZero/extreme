import "./style.css";
import { Counter, List, CustomComponent } from "./components";
import { App, Topbar, Content, Demo } from "./modules";

import { extreme } from "extreme";

extreme.use({
  Counter,
  List,
  CustomComponent,
  Topbar,
  Content,
});

const handleHashChange = () => {
  if (window.location.hash.match(/#\/demo/)) {
    Demo(document.getElementById("app")!, {}, false);
  } else {
    App(document.getElementById("app")!, {}, false);
  }
};

handleHashChange();
window.addEventListener("hashchange", handleHashChange);
