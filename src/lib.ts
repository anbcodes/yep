import {interpolateNumber, interpolateLab} from 'd3-interpolate';

const interpolate = (a: number, b: number, alpha: number) => {
    if (alpha < 0) return a;
    if (alpha > 1) return b;
    return alpha * b + (1 - alpha) * a;
};

interface AnimateFunction<T> {
    func: (startValue: T, currentTime: number) => T;
    startTime: number,
}

export const cubicInOut = (t: number) => t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;

export const animateNumber = (endValue: number, startTime: number, duration: number): AnimateFunction<number> => {
    let func = (startValue: number, currentTime: number) => interpolateNumber(startValue, endValue)(Math.max(0, Math.min(1, cubicInOut((currentTime - startTime) / duration))));
    return {func, startTime};
};

export const animateColor = (endValue: string, startTime: number, duration: number): AnimateFunction<string> => {
    let func = (startValue: string, currentTime: number) => interpolateLab(startValue, endValue)(Math.max(0, Math.min(1, cubicInOut((currentTime - startTime) / duration))));
    return {func, startTime};
};

export const combine =
    <T>(startOffset: number, ...functions: AnimateFunction<T>[]): AnimateFunction<T> => {
        let func = (startValue: T, currentTime: number) => functions
            .sort((a, b) => a.startTime - b.startTime)
            .filter(({startTime}) => startTime + startOffset < currentTime)
            .reduce((value, func, i, a) => {
                let t;
                if (a[i + 1] !== undefined) {
                    t = a[i + 1].startTime;
                } else {
                    t = currentTime - startOffset;
                }
                return func.func(value, t);
            }, startValue)
        return {func, startTime: startOffset}
    }

interface TempNameForFuncObject {
    duration: number,
}


export class AnimationObject {
    private props: {[name: string]: AnimateFunction<string | number>} = {};
    public fadeTo(to: number, duration = 1) {
        return (currentTime: number) => {
            if (this.props["opacity"]) {
                this.props["opacity"] = combine(0, this.props["opacity"], animateNumber(to, currentTime, duration))
            } else {
                this.props["opacity"] = animateNumber(to, currentTime, duration);
            }
            return {duration};
        }
    }
}

export class Animation {
    private time: number = 0;

    public play(func: (currentTime: number) => TempNameForFuncObject) {
        this.time += func(this.time).duration;
    }

    public run(func: (currentTime: number) => TempNameForFuncObject) {
        func(this.time);
    }

    public wait(time: number) {
        this.time += time;
    }
}