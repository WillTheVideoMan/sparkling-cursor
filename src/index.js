import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import pride from "./raw_pride.svg";

ReactDOM.render(
  <>
    <App count={8} size={16} gravity={2.5} spread={25} decay={0.4} />
    <button>Click For Glitter</button>
    <img src={pride} alt="pride logo" />
  </>,
  document.getElementById("root")
);
