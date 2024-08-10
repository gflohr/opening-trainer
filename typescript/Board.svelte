<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
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
	const unsubscribeChessTask = chessTask.subscribe(t => {
		if (t) {
			task = t;
			console.log(chessground);
		}
	});

	$: if (task) {
		config = task.chessgroundConfig;
	}

	onMount(() => {
		const params = new URLSearchParams(document.location.search);
		const configMode = params.has('configure');
		const chessgroundConfig: ChessgroundConfig = {
			addPieceZIndex: true,
			viewOnly: configMode,
		}

		chessTask.set(new ChessTask(chessgroundConfig));
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
