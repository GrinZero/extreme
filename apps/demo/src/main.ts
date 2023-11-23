import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { Counter, List, CustomComponent } from "./components";

import { extreme } from "./core";
import { useState } from "./hooks";

extreme.use({
  Counter,
  List,
  CustomComponent,
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + Extreme</h1>
    <div class="card">
      <button id="counter" type="button"></button>
      <button id="list" type="button"></button>
    </div>
    <p class="read-the-docs">
      open list
    </p>
  </div>
`;
Counter(document.querySelector<HTMLButtonElement>("#counter")!);

const [open, setOpen] = useState(true);

CustomComponent(document.querySelector<HTMLButtonElement>("#list")!, { open });

document.querySelector(".read-the-docs")!.addEventListener("click", () => {
  setOpen(!open());
});
