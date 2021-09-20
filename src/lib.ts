import { interpolate } from 'd3-interpolate';

/**
 * Cubic in out function
 * @param t linear value from 0 to 1
 * @returns cubic value from 0 to 1
 */
export const cubicInOut = (t: number) =>
  t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;


/**
 * Gets the current value of a property based on a list of instructions and a specified time
 * @param instructions The instructions to run
 * @param time The time to animate to
 * @returns 
 */
export const atTime = (instructions: Instruction[], time: number) => {
  return instructions
    .sort((a, b) => a.startTime - b.startTime)
    .filter(({ startTime }) => startTime < time)
    .reduce((value, instruction, i, a) => {
      let t;
      if (a[i + 1] !== undefined) {
        t = a[i + 1].startTime;
      } else {
        t = time;
      }
      return interpolate(
        value,
        instruction.endValue
      )(Math.max(0, Math.min(1, cubicInOut((t - instruction.startTime) / instruction.duration))));
    }, 0);
};


/**
 * Handles the global state of a animation
 */
export class Animation {
  /**
   * The current length of the animation
   */
  public length = 0;

  /**
   * Waits a specified number of seconds
   * @param seconds the number of seconds to wait in the animation
   */
  public wait(seconds: number) {
    this.length += seconds;
  }
}

/**
 * An instruction for a animation
 */
export interface Instruction {
  startTime: number;
  duration: number;
  endValue: any;
}


/**
 * A sample animation object
 */
export class Rect {
  /**
   * The different properties that can be animated
   */
  public props = {
    opacity: [] as Instruction[],
    fill: [] as Instruction[]
  };

  /**
   * Creates a new rect object
   * @param animation The animation that this rect is attached to
   */
  constructor(public animation: Animation) { }


  /**
   * Adds an animation to be played (advancing the time)
   * @param property The property to animate
   * @param to The value to animate to
   * @param duration The duration of this animation
   * @returns A reference to the created instruction
   */
  public play(property: keyof Rect["props"], to: any, duration = 1): Instruction {
    let instruction = this.run(property, to, duration);
    this.animation.length += duration;
    return instruction;
  }

  /**
   * Adds an animation to be run (does not advance the time)
   * @param property The property to animate
   * @param to The value to animate to
   * @param duration The duration of this animation
   * @returns A reference to the created instruction
   */
  public run(property: keyof Rect["props"], to: any, duration = 1): Instruction {
    let instruction = {
      startTime: this.animation.length,
      duration,
      endValue: to
    };
    this.props[property].push(instruction);
    return instruction;
  }

  /**
   * Sets the value of a property
   * @param property The property to set
   * @param value The value to set it to
   * @returns A reference to the created instruction
   */
  public set(property: keyof Rect["props"], value: any): Instruction {
    return this.run(property, value, 0);
  }
}

