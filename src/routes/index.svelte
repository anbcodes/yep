<script lang="ts">
	import { onMount } from 'svelte';
	import katex from 'katex';
	import { Animation, atTime, Instruction } from '$lib';
	import Rect, { RectAnimation } from '$lib/Rect.svelte';
	import Katex, { KatexAnimation } from '$lib/Katex.svelte';

	let videoWidth = 1000;
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

	let animation = new Animation();
	let widthSlider = 100;
	let heightSlider = 100;
	let rect: RectAnimation;
	let areaText: KatexAnimation;
	let widthText: KatexAnimation;
	let heightText: KatexAnimation;
	let opacityLevelInstruction: Instruction;
	let areaTextInitIntructions: { [key: string]: Instruction };
	let areaTextMoveInstructions: { [key: string]: Instruction };
	let rectInitIntructions: { [key: string]: Instruction };

	onMount(() => {
		rectInitIntructions = rect.setMany({
			stroke: 'white',
			x: '0px',
			y: '0px',
			width: '100px',
			height: '100px',
			strokeWidth: '2px',
			dashPercent: '0'
		});

		areaTextInitIntructions = areaText.setMany({
			text: 'a = wh',
			opacity: 0,
			fill: 'white',
			x: '-10px',
			y: '-10px',
			width: '200px',
			height: '10px'
		});

		areaText.runMany(
			{
				x: '20px',
				y: '20px',
				opacity: 1
			},
			1
		);
		rect.set('opacity', 1);
		rect.play('dashPercent', 100, 1);
	});

	$: if (rectInitIntructions) {
		rectInitIntructions.x.endValue = `${
			videoWidth / 2 - +rectInitIntructions.width.endValue.match(/[0-9]+/) / 2
		}px`;
		rectInitIntructions.y.endValue = `${
			videoHeight / 2 - +rectInitIntructions.height.endValue.match(/[0-9]+/) / 2
		}px`;
		rectInitIntructions.width.endValue = `${widthSlider}px`;
		rectInitIntructions.height.endValue = `${heightSlider}px`;
		videoTime = videoTime + 0.000000001;
	}

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
			<Rect bind:animation bind:videoTime bind:anim={rect} />
		</svg>
		<Katex bind:anim={areaText} bind:videoTime bind:animation />
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
<input type="range" min="1" max="300" step="1" bind:value={widthSlider} />
<input type="range" min="1" max="300" step="1" bind:value={heightSlider} />
