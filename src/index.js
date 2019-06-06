import React from "react";
import ReactDOM from "react-dom";
import App from "./GlitterParticles";
import pride from "./raw_pride.svg";

/**
 * Recommended settings:
 *  count: 8,
 *  size: 16,
 *  gravity: 3,
 *  spread: 25,
 *  decay: 0.25
 */
ReactDOM.render(
  <>
    <App count={8} size={16} gravity={3} spread={25} decay={0.25} />
    <img src={pride} alt="pride logo" />
  </>,
  document.getElementById("root")
);
