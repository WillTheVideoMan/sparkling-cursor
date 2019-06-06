import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * GlitterOverlay.js - Displays a burst of glitter wherever a user clicks/taps on screen.
 *
 * @param {integer} count - Defines the number of  particles per click/tap.
 * @param {integer} size - Defines the size of each  particle.
 * @param {integer} gravity - Defines how quickly the  falls.
 * @param {integer} spread - Defines how much the  spreads about the click/tap locus.
 * @param {integer} decay - Defines how quickly the  particles shrink in size.
 */
const GlitterOverlay = ({ count, size, gravity, spread, decay }) => {
  /**
   * An array of glitter particles.
   */
  const [particles, setParticles] = useState([]);

  /**
   * Holds the x and y coordinates of any screen input (click or tap) recorded during one animation cycle.
   */
  const [screenInput, setScreenInput] = useState();

  /**
   * Handles a click or tap event by setting relevant state variables.
   *
   * @param {object} e - the click or tap event.
   */
  const handleClick = e => {
    /**
     * If the event has touches accociated with it, then the input was a tap (TouchEvent) rather than a click (MouseEvent).
     * Hence, set the input to reference the first touch made with the screen.
     *
     * Else, set the input to reference the entire event (e), as a mouse event has no touches.
     */
    const input = e.touches ? e.touches[0] : e;

    /**
     * Set the new input position, which will cause a glitter burst to happen at this location.
     */
    setScreenInput({ x: input.clientX, y: input.clientY });
  };

  /**
   * Returns an RGB value for either R, G or B, based on the time and an optional time offset value.
   *
   * @param {integer} offset - A value representing the RGB offset from the current time.
   */
  const rgbValue = offset => {
    /**
     * Holds the current unix time in seconds.
     */
    const unixTime = Date.now() / 1000;

    /**
     * Define the interpolation parameters. Here, we are taking a sine value between 0 and 1 and mapping it
     * between an upper (y1) and lower (y0) RGB value.
     *
     * By using a sine wave based on time as an interpolant, we can get a smooth cycling through all the colours,
     * based on time.
     */
    const y0 = 75,
      y1 = 230,
      x0 = 0,
      x1 = 1,
      x = Math.abs(Math.sin(unixTime / 10 + unixTime * offset));

    /**
     * Return a rounded value of the interpolation between sine curve and RGB value.
     */
    return Math.floor((y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0));
  };

  /**
   * Main animation loop.
   */
  const animate = () => {
    /**
     * Define the next particles to be painted, by filtering out particles that have shrunk below
     * a zero radius (fully decayed) and by mapping the transformation parameters onto each particle.
     *
     * Note, x and y coordinated are altered by half the decay size to ensure the particles have no net
     * drift across the screen.
     */
    const nextParticles = particles
      .filter(particle => particle.r >= 0)
      .map(particle => {
        return {
          x: particle.x + decay / 2 + 1 - Math.random() * 2,
          y: particle.y + decay / 2 + gravity,
          r: particle.r - decay,
          c: particle.c
        };
      });

    /**
     * If the screen has been clicked, we need to add a particle burst onto the particle array.
     *
     * For the number of specified particles as defined by props, push a particle onto the next particles array,
     * applying the correct random spread as defined by props.
     *
     * The colour is determined by a cycling rgb function.
     */
    if (screenInput) {
      for (let i = 0; i < count; i++) {
        nextParticles.push({
          x: screenInput.x - spread / 2 + Math.random() * spread,
          y: screenInput.y - spread / 2 + Math.random() * spread,
          r: size,
          c: { r: rgbValue(0), g: rgbValue(1 / 3), b: rgbValue(2 / 3) }
        });
      }

      /**
       * Now that the particles have been added, set clicked back to null for the next animation cycle.
       */
      setScreenInput(null);
    }

    /**
     * Update the glitter particles held in state.
     */
    setParticles(nextParticles);
  };

  /**
   * Set window event listeners. Only run on first render.
   */
  useEffect(() => {
    /**
     * Define event listeners based on the device's window properties.
     *
     * If the ontouchstart property if present, it means we are using a touch device, and hence
     * should listen to touch events instead of mouse events.
     */
    const eventType = "ontouchstart" in window ? "touchstart" : "mousedown";
    window.addEventListener(eventType, handleClick);

    /**
     * On unmount, clean-up the event listener.
     */
    return () => {
      window.removeEventListener(eventType, handleClick);
    };
  }, []);

  /**
   * Animate the glitter particles every 66ms, but only if there are particles to animate or if the screen
   * has recently received an input.
   */
  useInterval(animate, particles.length > 0 || screenInput ? 66 : null);

  /**
   * Return all the particles with their calculated positions, colours and scales.
   *
   * A particle is simply an inline-styled (to keep this overlay self-contained) '+' character.
   */
  return particles.map((particle, index) => (
    <div
      key={index}
      style={{
        position: "fixed",
        zIndex: "99",
        userSelect: "none",
        fontWeight: "bolder",
        top: particle.y,
        left: particle.x,
        fontSize: particle.r + "px",
        color:
          "rgba(" +
          particle.c.r +
          ", " +
          particle.c.g +
          ", " +
          particle.c.b +
          ", 1)"
      }}
    >
      +
    </div>
  ));
};

GlitterOverlay.propTypes = {
  count: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  gravity: PropTypes.number.isRequired,
  spread: PropTypes.number.isRequired,
  decay: PropTypes.number.isRequired
};

export default GlitterOverlay;

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

    /**
     * If there is no delay, then don't set an interval.
     * Else, set an interval based on delay.
     */
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
