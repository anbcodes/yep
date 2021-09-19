import { interpolateNumber, interpolateLab } from 'd3-interpolate';

interface AnimateFunction<T> {
  func: (startValue: T, currentTime: number) => T;
  startTime: number,
}

export const cubicInOut = (t: number) => t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;

export const animateNumber = (endValue: number, startTime: number, duration: number): AnimateFunction<number> => {
  let func = (startValue: number, currentTime: number) => interpolateNumber(startValue, endValue)(Math.max(0, Math.min(1, cubicInOut((currentTime - startTime) / duration))));
  return { func, startTime };
};

export const animateColor = (endValue: string, startTime: number, duration: number): AnimateFunction<string> => {
  let func = (startValue: string, currentTime: number) => interpolateLab(startValue, endValue)(Math.max(0, Math.min(1, cubicInOut((currentTime - startTime) / duration))));
  return { func, startTime };
};

export const combine =
  <T>(startOffset: number, ...functions: AnimateFunction<T>[]): AnimateFunction<T> => {
    let func = (startValue: T, currentTime: number) => functions
      .sort((a, b) => a.startTime - b.startTime)
      .filter(({ startTime }) => startTime + startOffset < currentTime)
      .reduce((value, func, i, a) => {
        let t;
        if (a[i + 1] !== undefined) {
          t = a[i + 1].startTime;
        } else {
          t = currentTime - startOffset;
        }
        return func.func(value, t);
      }, startValue)
    return { func, startTime: startOffset }
  }

interface TempNameForFuncObject {
  duration: number,
}

type AnimateFunctionProperites<T extends { [name: string]: <D>(endValue: D, startTime: number, duration: number) => AnimateFunction<D> }> = { [V in keyof T]: ReturnType<T[V]> }

export class AnimationObject<U extends { [name: string]: (endValue: any, startTime: number, duration: number) => AnimateFunction<typeof endValue> }> {
  public props: AnimateFunctionProperites<U> = {} as AnimateFunctionProperites<U>;
  public functions: U;

  constructor(properties: U) {
    this.functions = properties;
    for (let key in properties) {
      //@ts-ignore
      this.props[key] = combine(0);
    }
  }

  public animate<T extends keyof AnimateFunctionProperites<U>>(property: T, to: ReturnType<ReturnType<U[T]>["func"]>, duration = 1) {
    return (currentTime: number) => {
      if (this.props[property]) {
        //@ts-ignore
        this.props[property] = combine(0, this.props[property], this.functions[property](to, currentTime, duration))
      } else {
        //@ts-ignore
        this.props[property] = this.functions[property](to, currentTime, duration);
      }
      return { duration };
    }
  }
}

export class Animation {
  public time: number = 0;

  public play(func: (currentTime: number) => TempNameForFuncObject) {
    this.time += func(this.time).duration;
    return this;
  }

  public run(func: (currentTime: number) => TempNameForFuncObject) {
    func(this.time);
    return this;
  }

  public wait(time: number) {
    this.time += time;
    return this;
  }
}