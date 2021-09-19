<script lang="ts">
	import { combine, animateNumber, animateColor, Animation, AnimationObject } from '$lib';
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

	// setInterval(() => {
	// 	if (playing) {
	// 		videoTime += 1/30;
	// 	}
	// }, 1000 / 30)

	let rotation = combine(0, animateNumber(45, 2, 1));

	let opacity = combine<number>(0);

	let x = combine(0, animateNumber(70, 2, 1));

	let y = combine(0, animateNumber(70, 2, 1));

	let background = combine(
		2,
		animateColor('white', 0, 1),
		animateColor('red', 1, 1),
		animateColor('lime', 2, 1),
		animateColor('blue', 3, 1)
	);

	let strokeOffset = combine(0, animateNumber(0, 0, 1));

	let textX = combine(0, animateNumber(200, 0, 1));

	let textY = animateNumber(100, 0, 1);

	let textOpacity = combine(0, animateNumber(1, 0, 1));

	let svg: SVGElement;

	let katexString = katex.renderToString('c = \\pm\\sqrt{a^2 + b^2}', {
		throwOnError: false
	});

	let animation = new Animation();
	let rect = new AnimationObject({
		width: animateNumber,
		height: animateNumber,
		fill: animateColor,
		opacity: animateNumber,
		stroke: animateColor,
		strokeWidth: animateNumber,
		dashOffset: animateNumber,
		x: animateNumber,
		y: animateNumber,
		rotation: animateNumber
	});

	animation
		.run(rect.animate('width', 100, 0))
		.run(rect.animate('height', 100, 0))
		.run(rect.animate('stroke', 'white', 0))
		.run(rect.animate('strokeWidth', 2, 0))
		.run(rect.animate('fill', 'black', 0))
		.run(rect.animate('dashOffset', 400, 0))
		.wait(1)
		.play(rect.animate('dashOffset', 0))
		.play(rect.animate('x', 40))
		.play(rect.animate('y', 40))
		.play(rect.animate('fill', 'white'))
		.play(rect.animate('rotation', 45))
		.run(rect.animate('width', 50))
		.run(rect.animate('x', 65))
		.run(rect.animate('y', 65))
		.play(rect.animate('height', 50))
		.play(rect.animate('fill', 'blue'))
		.play(rect.animate('rotation', 0))
		.run(rect.animate('width', 100))
		.run(rect.animate('x', 40))
		.run(rect.animate('y', 40))
		.play(rect.animate('height', 100))
		.play(rect.animate('x', 80))
		.play(rect.animate('fill', 'black'))
		.play(rect.animate('dashOffset', 400));

	videoLength = animation.time;

	// how I want it to look
	// let animation = new Animation();
	// let rect = animation.rect(x, y, w, h, color, strokewidth, etc...)
	// animation
	//  .play(rotate(rect, 45))
	//	.run(rotate(rect, 45))
	//  .wait(1)
	//
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
				opacity={rect.props.opacity.func(1, videoTime)}
				x={rect.props.x.func(0, videoTime)}
				y={rect.props.y.func(0, videoTime)}
				width={rect.props.width.func(0, videoTime)}
				height={rect.props.height.func(0, videoTime)}
				stroke={rect.props.stroke.func('black', videoTime)}
				stroke-width={`${rect.props.strokeWidth.func(0, videoTime)}px`}
				fill={rect.props.fill.func('white', videoTime)}
				stroke-dasharray={(rect.props.width.func(0, videoTime) +
					rect.props.height.func(0, videoTime)) *
					2}
				stroke-dashoffset={rect.props.dashOffset.func(0, videoTime)}
				transform={`rotate(${rect.props.rotation.func(0, videoTime)}, ${
					rect.props.x.func(0, videoTime) + rect.props.width.func(0, videoTime) / 2
				}, ${rect.props.y.func(0, videoTime) + rect.props.height.func(0, videoTime) / 2})`}
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
