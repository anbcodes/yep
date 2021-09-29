<script lang="ts">
	import { onMount } from 'svelte';
	import katex from 'katex';
	import { Animation, atTime, Instruction } from '$lib';
	import Rect, { RectAnimation } from '$lib/Rect.svelte';
	import Katex, { KatexAnimation } from '$lib/Katex.svelte';

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

	let animation = new Animation();
	let opacitySlider = 1;
	let rect: RectAnimation;
	let areaText: KatexAnimation;
	let widthText: KatexAnimation;
	let heightText: KatexAnimation;
	let opacityLevelInstruction: Instruction;

	onMount(() => {
		rect.set('stroke', 'white');
		rect.set('x', '50px');
		rect.set('y', '50px');
		rect.set('width', '50px');
		rect.set('height', '50px');
		rect.set('strokeWidth', '2px');
		rect.set('dashPercent', 0);
		areaText.set('text', 'a = wh');
		areaText.set('opacity', 1);
		areaText.set('fill', 'white');
		areaText.set('x', 0);
		areaText.set('y', 0);
		areaText.set('width', 200);
		areaText.set('height', 20);
		opacityLevelInstruction = rect.set('opacity', 1);
		rect.play('dashPercent', 100, 1);
	});

	$: {
		if (opacityLevelInstruction) {
			opacityLevelInstruction.endValue = opacitySlider;
			videoTime = videoTime + 0.000000001;
		}
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
<input type="range" min="0" max="1" step="0.01" bind:value={opacitySlider} />
