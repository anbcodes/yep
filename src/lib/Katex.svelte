<script lang="ts" context="module">
	export class KatexAnimation extends AnimationObject {
		public props = {
			opacity: [] as Instruction[],
			fill: [] as Instruction[],
			background: [] as Instruction[],
			width: [] as Instruction[],
			height: [] as Instruction[],
			x: [] as Instruction[],
			y: [] as Instruction[],
			text: [] as Instruction[]
		};

		public compute(property: keyof this['props'], time: number): any {
			if (property === 'text') {
				return super.compute(property, time, (start, end) => (current) => {
					return end;
				});
			} else {
				return super.compute(property, time);
			}
		}
	}
</script>

<script lang="ts">
	import { Animation, AnimationObject, Instruction } from '$lib';
	import katex from 'katex';

	export let animation: Animation;
	export let videoTime: number = 0;
	export let anim = new KatexAnimation(animation);
</script>

<div
	style={`
    opacity: ${anim.compute('opacity', videoTime)};
    position: absolute;
    left: ${anim.compute('x', videoTime)};
    top: ${anim.compute('y', videoTime)};
    color: ${anim.compute('fill', videoTime)};
    background-color: ${anim.compute('background', videoTime)};
    width: ${anim.compute('width', videoTime)};
    height: ${anim.compute('height', videoTime)};
    `}
>
	{@html anim.compute('text', videoTime)
		? katex.renderToString(anim.compute('text', videoTime))
		: ''}
</div>
