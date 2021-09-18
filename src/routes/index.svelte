<script lang="ts">
	import { tweened, Tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	let videoWidth = 600;
	let videoHeight = 0;
	$: videoHeight = (videoWidth / 25) * 9;

	let videoTime = 0;
	let videoLenght = 10;

	let time = 0;

	let testFunc = () => {
		const width2 = tweened(time / 400, {
			duration: 400,
			easing: cubicInOut
		});
		console.log(width2);
	};

	let animation = [];

	const animate = (animation, time) => {
		animation.forEach((instruction) => {
			let amount = cubicInOut(
				Math.max(0, Math.min(1, time - instruction.start)) / instruction.duration
			);
			instruction.element.style.opacity = amount;
		});
	};

	let svg: SVGElement;

	// const makeRect = (x, y, width, height) => {
	//     let element = document.create;
	//     element.width = width;
	//     element.height = height;
	//     element.x = x;
	//     element.y = y;
	//     svg.appendChild(element);
	//     return element;
	// }

	// const fadeIn = (object: SVGElement, duration: number, time: number) => {
	//     animation.push({
	//         start: time,
	//         duration,
	//         element: object,
	//     });
	// }

	let mounted = false;

	// onMount(() => {
	//     mounted = true;
	//     let rect = makeRect(0, 0, 100, 100)
	//     fadeIn(rect, 1, 1);
	// });

	// $: if (mounted) {
	//     animate(animation, time)
	//     console.log(time)
	// };

	const timing = (time, start, duration) => {
		let v = cubicInOut(Math.max(0, Math.min(1, time - start)) / duration);
		console.log('returning', v);
		return v;
	};

	const interpolate = (a, b, alpha) => {
		if (alpha < 0) return a;
		if (alpha > 1) return b;
		return alpha * b + (1 - alpha) * a;
	};

	const fadeTo = (to, start, duration) => {
		let func = (startValue, currentTime) => interpolate(startValue, to, cubicInOut((currentTime - start) / duration));
		return {func, start};
	};

	const combine =
		(startOffset: number, ...functions) => {
            let func = (startValue: number, currentTime: number) => functions
                .sort((a, b) => a.start - b.start)
                .filter(({start}) => start + startOffset < currentTime)
                .reduce((value, func, i, a) => {
                    let t;
                    if (a[i + 1] !== undefined) {
                        t = a[i + 1].start;
                    } else {
                        t = currentTime - startOffset;
                    }
                    return func.func(value, t);
                }, startValue)
            return {func, start: startOffset}
        }
		

	let opacity = combine(
        0,
        fadeTo(1, 1, 1),
        fadeTo(0, 1.5, 1),
        fadeTo(1, 2, 1)
    );

	const actions = (...actions) => {
		return actions.find((v) => v !== 0 && v !== 1) || actions.slice(-1)[0];
	};
</script>

<div>
	<div>
		<svg
			width={videoWidth}
			height={videoHeight}
			style="border: 1px solid black; background-color: black"
		>
			<rect
                opacity={opacity.func(0, time)}
				stroke="white"
				stroke-width="2"
				width={100}
				height={100}
			/>
		</svg>
	</div>
	<input type="range" min="0" max="4" step="0.01" bind:value={time} />
</div>
