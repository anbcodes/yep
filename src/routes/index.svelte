<script lang="ts">
	import { onMount } from 'svelte';
	import katex from 'katex';
	import { Animation, atTime, Rect } from '$lib';

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
	let opacitySlider = 0;
	let rect = new Rect(animation);
	rect.set('stroke', 'white');
	rect.set('width', '50px');
	rect.set('height', '50px');
	rect.set('strokeWidth', '2px');
	rect.set('dashPercent', 0);
	let opacityLevelInstruction = rect.set('opacity', 1);
	// $: {
	// 	opacityLevelInstruction.endValue = opacitySlider;
	// 	rect.props.opacity = rect.props.opacity;
	// }
	rect.play('dashPercent', 100, 1);

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
				width={rect.compute('width', videoTime)}
				height={rect.compute('height', videoTime)}
				stroke={rect.compute('stroke', videoTime)}
				stroke-width={rect.compute('strokeWidth', videoTime)}
				fill={atTime(rect.props.fill, videoTime)}
				stroke-dashoffset={rect.compute('dashOffset', videoTime)}
				stroke-dasharray={rect.compute('dashArray', videoTime)}
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
