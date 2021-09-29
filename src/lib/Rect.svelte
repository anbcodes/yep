<script lang="ts" context="module">
	export class RectAnimation extends AnimationObject {
		public props = {
			opacity: [] as Instruction[],
			fill: [] as Instruction[],
			width: [] as Instruction[],
			height: [] as Instruction[],
			stroke: [] as Instruction[],
			dashPercent: [] as Instruction[],
			strokeWidth: [] as Instruction[],
			x: [] as Instruction[],
			y: [] as Instruction[]
		};

		public compute(property: keyof this['props'] | 'dashArray' | 'dashOffset', time: number): any {
			if (property === 'dashArray') {
				let w = this.compute('width', time);
				let h = this.compute('height', time);
				if (typeof w === 'number' && typeof h === 'number') {
					return w * 2 + h * 2;
				} else if (typeof w === 'number' || typeof h === 'number') {
					throw new Error('Mismatched width and height types');
				}
				let [_, wValue, wUnits] = w.match(/([0-9]+)([^]*)/);
				let [t, hValue, hUnits] = h.match(/([0-9]+)([^]*)/);

				if (wUnits.trim() !== hUnits.trim()) {
					throw new Error(
						`Width and height must have the same units (not '${wUnits}' and '${hUnits}')`
					);
				}
				return (+wValue + +hValue) * 2 + wUnits;
			} else if (property === 'dashOffset') {
				let total = this.compute('dashArray', time);
				let percent = this.compute('dashPercent', time) / 100;
				if (typeof total === 'string') {
					let [_, totalValue, totalUnits] = total.match(/([0-9]+)([^]*)/);
					return interpolate(+totalValue, 0)(+percent) + totalUnits;
				}
				console.log('t', total);
				return interpolate(total, 0)(+percent);
			} else {
				return super.compute(property, time);
			}
		}
	}
</script>

<script lang="ts">
	import { Animation, AnimationObject, Instruction } from '$lib';
	import { interpolate } from 'd3-interpolate';

	export let animation: Animation;
	export let videoTime: number = 0;
	export let anim = new RectAnimation(animation);
</script>

<rect
	opacity={anim.compute('opacity', videoTime)}
	x={anim.compute('x', videoTime)}
	y={anim.compute('y', videoTime)}
	width={anim.compute('width', videoTime)}
	height={anim.compute('height', videoTime)}
	stroke={anim.compute('stroke', videoTime)}
	stroke-width={anim.compute('strokeWidth', videoTime)}
	fill={anim.compute('fill', videoTime)}
	stroke-dashoffset={anim.compute('dashOffset', videoTime)}
	stroke-dasharray={anim.compute('dashArray', videoTime)}
/>
