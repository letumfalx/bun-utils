import "./app.css";

import { render } from "preact";
import { App } from "./App";

const containerNode = document.getElementById("app");
if (!containerNode) throw new Error("cannot find root ");

render(<App />, containerNode);
