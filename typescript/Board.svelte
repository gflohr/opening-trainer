<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ChessgroundUnstyled as Chessground } from 'svelte-chessground';
	import type { Config as ChessgroundConfig } from 'chessground/config';
	import { configuration, chessTask } from './store';
	import { ChessTask } from './chess-task';

	let chessground: Chessground;
	let classes: Array<string> = ['loading'];
	let config: ChessgroundConfig = {};

	const unsubscribeConfiguration = configuration.subscribe(config => {
		if (!config) {
			return;
		}

		classes = [];
		if (config.board['3D']) {
			classes.push('is3d');
			classes.push('cot-board-' + config.board['3Dboard']);
			classes.push('pieces-' + config.board['3Dpieces']);
		} else {
			classes.push('is2d');
			classes.push('cot-board-' + config.board['2Dboard']);
		}
	});

	let task: ChessTask;
	const unsubscribeChessTask= chessTask.subscribe(t => {
		task = t;
	});

	$: if (task) {
		config = task.chessgroundConfig;
	}

	onMount(async () => {
		chessground.set( {
			movable: {
				events: {
					after: task.moveHandler(),
				}
			},
		});
	});

	onDestroy(() => {
		unsubscribeConfiguration();
		unsubscribeChessTask();
	});
</script>

<chess-board class={classes.join(' ')}>
	<Chessground bind:this={chessground} {config} />
</chess-board>

<style lang="scss">
	chess-board {
		position: relative;
	}

	chess-board.loading {
		visibility: hidden;
	}
</style>
