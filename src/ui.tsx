import * as React from "react";
import { createRoot } from "react-dom/client";

import "./tools.css";
import { BrowserRouter as Router } from "react-router-dom";

import { getState } from "./state";

import chat from "./../assets/chat.gif";
import "regenerator-runtime/runtime";

let fakeInput = document.getElementById("fake-input");

function UI({}) {
  return (
    <>
      <div id="items">
        <img
          src={chat}
          className="tool"
          id="chat-image"
          onClick={(e) => {
            e.stopPropagation();
            let state = getState();
            state.me.target = state.me.pos;
            fakeInput.focus();
          }}
        />
      </div>
    </>
  );
}

function startUI() {
  console.log("starting");

  let rootElement = document.getElementById("ui");
  let root = createRoot(rootElement!); // createRoot(container!) if you use TypeScript
  root.render(
    <Router>
      <UI />
    </Router>
  );
}

export { startUI };
