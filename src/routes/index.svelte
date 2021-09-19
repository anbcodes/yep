<script lang="ts">
	import { interpolateNumber, interpolateLab, interpolate } from 'd3-interpolate';

	import { onMount } from 'svelte';
	import katex from 'katex';

	let videoWidth = 600;
	let videoHeight = 0;
	$: videoHeight = (videoWidth / 16) * 9;

	let videoLength = 10;

	let videoTime = 0;

	let playing = false;

	let prevTime = 0;
	const render = (timeMs: number) => {
		let dt = timeMs - prevTime;
		prevTime = timeMs;
		if (playing) {
			videoTime += dt / 1000;
		}

		if (videoTime >= videoLength) {
			videoTime = videoLength;
			playing = false;
		}
		requestAnimationFrame(render);
	};

	onMount(() => {
		requestAnimationFrame(render);
	});

	let svg: SVGElement;

	// let katexString = katex.renderToString('c = \\pm\\sqrt{a^2 + b^2}', {
	// 	throwOnError: false
	// });

	interface Instruction {
		startTime: number;
		duration: number;
		endValue: any;
	}

	class Rect {
		public props = {
			opacity: [] as Instruction[],
			fill: [] as Instruction[]
		};

		constructor(public animation: Animation) {}

		public play(property: keyof typeof this.props, to: any, duration: number): Instruction {
			let instruction = this.run(property, to, duration);
			this.animation.length += duration;
			return instruction;
		}

		public run(property: keyof typeof this.props, to: any, duration: number): Instruction {
			let instruction = {
				startTime: this.animation.length,
				duration,
				endValue: to
			};
			this.props[property].push(instruction);
			return instruction;
		}

		public set(property: keyof typeof this.props, to: any): Instruction {
			return this.run(property, to, 0);
		}
	}

	class Animation {
		public length = 0;

		public wait(time: number) {
			this.length += time;
		}
	}

	let animation = new Animation();
	let opacitySlider = 0;
	let rect = new Rect(animation);
	rect.set('fill', 'white');
	let opacityLevelInstruction = rect.play('opacity', 1, 1);
	$: {
		opacityLevelInstruction.endValue = opacitySlider;
		rect.props.opacity = rect.props.opacity;
	}
	rect.play('fill', 'blue', 1);

	const cubicInOut = (t: number) =>
		t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;

	const atTime = (property: Instruction[], time: number) => {
		return property
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

	videoLength = 5;
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.css"
		integrity="sha384-zTROYFVGOfTw7JV7KUu8udsvW2fx4lWOsCEDqhBreBwlHI4ioVRtmIvEThzJHGET"
		crossorigin="anonymous"
	/>
</svelte:head>

<div>
	<div style="padding: 0px; margin: 0px; position: relative">
		<svg
			width={videoWidth}
			height={videoHeight}
			bind:this={svg}
			style="border: 1px solid black; background-color: black"
		>
			<rect
				opacity={atTime(rect.props.opacity, videoTime)}
				x="50"
				y="50"
				width="50"
				height="50"
				fill={atTime(rect.props.fill, videoTime)}
			/>
		</svg>
		<!-- <div style={`z-index: 2; opacity: ${textOpacity.func(0, videoTime) * 100}%; position: absolute; left: ${textX.func(0, videoTime)}px; top: ${textY.func(0, videoTime)}px; color: white`}>
			{@html katexString}
		</div> -->
	</div>

	<input
		type="range"
		min="0"
		max={videoLength}
		step="0.01"
		on:mousedown={() => (playing = false)}
		bind:value={videoTime}
	/>

	<button on:click={() => (playing = !playing)}>{playing ? 'Pause' : 'Play'}</button>
</div>
<input type="range" min="0" max="1" step="0.01" bind:value={opacitySlider} />
