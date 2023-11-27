import "./style.css";
import { Counter, List, CustomComponent } from "./components";
import { App, Topbar, Content } from "./modules";

import { extreme } from "extreme";

extreme.use({
  Counter,
  List,
  CustomComponent,
  App,
  Topbar,
  Content,
});

App(document.getElementById("app")!);
