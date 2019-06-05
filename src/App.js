import React, { useRef, useEffect, useState } from "react";

function App({ count, size, gravity, spread, decay }) {
  const [circles, setCircles] = useState([]);
  const [screenClicked, setScreenClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const style = {
    position: "fixed",
    userSelect: "none",
    fontWeight: "bolder",
    borderRadius: "100%"
  };

  const animate = () => {
    const newCircles = circles
      .filter(circle => circle.r >= 0)
      .map(circle => {
        return {
          x: circle.x + decay / 2 + 1 - Math.random() * 2,
          y: circle.y + decay / 2 + gravity,
          r: circle.r - decay,
          c: circle.c
        };
      });

    if (screenClicked) {
      for (let i = 0; i < count; i++) {
        newCircles.push({
          x: mousePos.x - spread / 2 + Math.random() * spread,
          y: mousePos.y - spread / 2 + Math.random() * spread,
          r: size,
          c: { r: rgbValue(0), g: rgbValue(1 / 3), b: rgbValue(2 / 3) }
        });
      }
      setScreenClicked(false);
    }
    setCircles(newCircles);
  };

  const handleClick = e => {
    const click = e.touches ? e.touches[0] : e;
    setMousePos({ x: click.clientX, y: click.clientY });
    setScreenClicked(true);
  };

  const rgbValue = offset => {
    const unixTime = Date.now() / 1000;
    const y0 = 75,
      y1 = 230,
      x0 = 0,
      x1 = 1,
      x = Math.abs(Math.sin(unixTime / 10 + unixTime * offset));

    return Math.floor((y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0));
  };

  useEffect(() => {
    const event = "ontouchstart" in window ? "touchstart" : "mousedown";
    window.addEventListener(event, handleClick);
    return () => {
      window.removeEventListener(event, handleClick);
    };
  }, []);

  useInterval(animate, 75);

  return (
    <>
      {circles.map((circle, index) => (
        <div
          key={index}
          style={{
            ...style,
            top: circle.y,
            left: circle.x,
            fontSize: circle.r + "px",
            color:
              "rgba(" +
              circle.c.r +
              ", " +
              circle.c.g +
              ", " +
              circle.c.b +
              ", 1)"
          }}
        >
          +
        </div>
      ))}
    </>
  );
}

/**
 * Custom Hook to execute a callback every given interval.
 */
function useInterval(callback, delay) {
  /**
   * Stores the callback in a ref to allow persistance between renders.
   */
  const savedCallback = useRef();

  /**
   * Set the callack ref to callback function of each render.
   *
   * The callback function will be redefined each render,
   * but we have captured the callback when this component mounts.
   */
  useEffect(() => {
    savedCallback.current = callback;
  });

  /**
   * Call the function every interval.
   *
   * Restart the interval if the delay value changes.
   *
   * If the component unmounts, cleanup the interval.
   */
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default App;
